import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2,
  Eye,
  Reply,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";

interface MessageThread {
  internId: string;
  name: string;
  email: string;
  phone: string;
  qualificationPath: string;
  categoryName: string | null;
  subcategoryName: string | null;
  latestSubject: string;
  latestMessage: string;
  latestSenderType: "intern" | "admin";
  latestAt: string;
  totalMessages: number;
  unreadCount: number;
}

interface InternMessage {
  id: string;
  internId: string;
  senderType: "intern" | "admin";
  subject: string;
  message: string;
  adminUsername: string | null;
  isRead: boolean;
  createdAt: string;
}

interface ConversationResponse {
  intern: {
    id: string;
    name: string;
    email: string;
    phone: string;
    qualificationPath: string;
    categoryName: string | null;
    subcategoryName: string | null;
  };
  messages: InternMessage[];
}

const replySchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message is too long"),
});
type ReplyValues = z.infer<typeof replySchema>;

const pathLabel = (p: string) => {
  if (p === "course_first") return "Training";
  if (p === "entrance_test") return "Entrance Test";
  return p || "—";
};

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
};

export default function AdminMessagesModule() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [viewInternId, setViewInternId] = useState<string | null>(null);
  const [replyInternId, setReplyInternId] = useState<string | null>(null);
  const [replyContext, setReplyContext] = useState<{
    name: string;
    subject: string;
  } | null>(null);

  const { data: threads = [], isLoading } = useQuery<MessageThread[]>({
    queryKey: ["/api/admin/messages"],
  });

  const { data: conversation, isLoading: convLoading } =
    useQuery<ConversationResponse>({
      queryKey: ["/api/admin/messages", viewInternId],
      enabled: !!viewInternId,
      queryFn: async () => {
        const res = await fetch(`/api/admin/messages/${viewInternId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Request failed: ${res.statusText}`);
        return res.json();
      },
    });

  const form = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { subject: "", message: "" },
  });

  const replyMutation = useMutation({
    mutationFn: async ({
      internId,
      values,
    }: {
      internId: string;
      values: ReplyValues;
    }) => {
      return await apiRequest(`/api/admin/messages/${internId}/reply`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({ title: "Reply sent" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      if (viewInternId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/admin/messages", viewInternId],
        });
      }
      form.reset({ subject: "", message: "" });
      setReplyInternId(null);
      setReplyContext(null);
    },
    onError: (err: any) => {
      toast({
        title: "Failed to send reply",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const filtered = threads.filter((t) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.categoryName || "").toLowerCase().includes(q) ||
      (t.subcategoryName || "").toLowerCase().includes(q) ||
      t.latestSubject.toLowerCase().includes(q)
    );
  });

  const openReply = (t: MessageThread) => {
    setReplyInternId(t.internId);
    setReplyContext({ name: t.name, subject: t.latestSubject });
    form.reset({
      subject: t.latestSubject.toLowerCase().startsWith("re:")
        ? t.latestSubject
        : `Re: ${t.latestSubject}`,
      message: "",
    });
  };

  const openReplyFromConversation = () => {
    if (!conversation) return;
    const lastFromIntern = [...conversation.messages]
      .reverse()
      .find((m) => m.senderType === "intern");
    const subj = lastFromIntern?.subject || "Message from admin";
    setReplyInternId(conversation.intern.id);
    setReplyContext({ name: conversation.intern.name, subject: subj });
    form.reset({
      subject: subj.toLowerCase().startsWith("re:") ? subj : `Re: ${subj}`,
      message: "",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <CardDescription>
            Conversations from interns. Click the eye icon to view the full
            thread, or reply directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, category, subject..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-messages"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No messages yet.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Category / Subcategory</TableHead>
                    <TableHead>Latest Subject</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow
                      key={t.internId}
                      data-testid={`row-thread-${t.internId}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {t.name}
                          {t.unreadCount > 0 && (
                            <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {t.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {t.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-cyan-500/20 text-cyan-300"
                        >
                          {pathLabel(t.qualificationPath)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {t.categoryName || (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {t.subcategoryName && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {t.subcategoryName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs max-w-[280px] truncate">
                        {t.latestSubject}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {formatDate(t.latestAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewInternId(t.internId)}
                            data-testid={`button-view-${t.internId}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openReply(t)}
                            data-testid={`button-reply-${t.internId}`}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View full conversation */}
      <Dialog
        open={!!viewInternId}
        onOpenChange={(open) => {
          if (!open) setViewInternId(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {conversation?.intern?.name || "Conversation"}
            </DialogTitle>
            <DialogDescription>
              {conversation?.intern?.email}
              {conversation?.intern?.categoryName ? (
                <>
                  {" · "}
                  {conversation.intern.categoryName}
                  {conversation.intern.subcategoryName
                    ? ` / ${conversation.intern.subcategoryName}`
                    : ""}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          {convLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !conversation || conversation.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No messages.
            </p>
          ) : (
            <div className="space-y-3">
              {conversation.messages.map((m) => {
                const isAdmin = m.senderType === "admin";
                return (
                  <div
                    key={m.id}
                    data-testid={`message-${m.id}`}
                    className={`rounded-lg border p-3 ${
                      isAdmin
                        ? "bg-blue-500/5 border-blue-500/30"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <Badge className="bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Admin
                            {m.adminUsername ? ` · ${m.adminUsername}` : ""}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <User className="h-3 w-3 mr-1" />
                            Intern
                          </Badge>
                        )}
                        <span className="font-medium text-sm">{m.subject}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {m.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setViewInternId(null)}
              data-testid="button-close-view"
            >
              Close
            </Button>
            <Button
              onClick={openReplyFromConversation}
              disabled={!conversation}
              data-testid="button-reply-from-view"
            >
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply dialog */}
      <Dialog
        open={!!replyInternId}
        onOpenChange={(open) => {
          if (!open) {
            setReplyInternId(null);
            setReplyContext(null);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Reply{replyContext?.name ? ` to ${replyContext.name}` : ""}
            </DialogTitle>
            {replyContext?.subject && (
              <DialogDescription>
                Re: {replyContext.subject}
              </DialogDescription>
            )}
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                if (!replyInternId) return;
                replyMutation.mutate({ internId: replyInternId, values });
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-reply-subject"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Write your reply..."
                        data-testid="input-reply-body"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReplyInternId(null);
                    setReplyContext(null);
                  }}
                  data-testid="button-cancel-reply"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={replyMutation.isPending}
                  data-testid="button-submit-reply"
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Reply
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
