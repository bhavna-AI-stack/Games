import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Github,
  Triangle,
  ArrowRight,
  Rocket,
  Loader2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'

const githubRepoUrlRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+?(\.git)?\/?$/

const schema = z.object({
  sourceUrl: z.string().regex(githubRepoUrlRegex, 'Must be a valid GitHub repo URL (https://github.com/owner/repo)'),
  targetUrl: z.string().regex(githubRepoUrlRegex, 'Must be a valid GitHub repo URL (https://github.com/owner/repo)'),
  email: z.string().email('Please enter a valid email address.'),
})

export default function App() {
  const [result, setResult] = useState({ kind: 'idle' })
  const statusRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (result.kind === 'success' || result.kind === 'error') {
      statusRef.current?.focus()
    }
  }, [result.kind])

  async function onSubmit(values) {
    setResult({ kind: 'loading' })
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: values.sourceUrl.replace(/\.git\/?$/, '').replace(/\/$/, ''),
          targetUrl: values.targetUrl.replace(/\.git\/?$/, '').replace(/\/$/, ''),
          email: values.email,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setResult({ kind: 'error', message: data.error ?? `Server error (${res.status})` })
      } else {
        setResult({ kind: 'success', vercelUrl: data.vercelUrl, githubUrl: data.githubUrl })
      }
    } catch {
      setResult({ kind: 'error', message: 'Network error — could not reach the server.' })
    }
  }

  function handleReset() {
    reset()
    setResult({ kind: 'idle' })
  }

  const isLoading = result.kind === 'loading'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Icon header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <IconChip><Github size={22} /></IconChip>
          <ArrowRight size={18} color="var(--muted)" />
          <IconChip><Triangle size={18} fill="var(--text)" /></IconChip>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <h1 style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Repo Copy &amp; Deploy
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Automate cross-account repository cloning and Vercel deployment.
          </p>

          {result.kind === 'success' ? (
            <div ref={statusRef} role="status" aria-live="polite" tabIndex={-1} style={{ outline: 'none' }}>
              <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Deployment complete. Your files are live.
              </p>
              <LinkRow href={result.vercelUrl} icon={<Triangle size={16} fill="var(--text)" />} label="Live Vercel URL" url={result.vercelUrl} />
              <LinkRow href={result.githubUrl} icon={<Github size={16} />} label="GitHub folder" url={result.githubUrl} />
              <Btn onClick={handleReset} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
                Deploy another
              </Btn>
            </div>

          ) : result.kind === 'error' ? (
            <div ref={statusRef} role="alert" aria-live="assertive" tabIndex={-1} style={{ outline: 'none' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <AlertCircle size={18} color="var(--error)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ color: 'var(--error)', fontSize: '0.875rem', lineHeight: 1.5 }}>{result.message}</p>
              </div>
              <Btn onClick={handleReset} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
                Try again
              </Btn>
            </div>

          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Field label="GitHub URL 1 (source)" hint="The repository to copy from." error={errors.sourceUrl?.message}>
                <Input placeholder="https://github.com/owner/repo" {...register('sourceUrl')} />
              </Field>

              <Field label="GitHub URL 2 (target account/repo)" hint="A brand new repo will be created in the target account with this name." error={errors.targetUrl?.message}>
                <Input placeholder="https://github.com/owner/repo" {...register('targetUrl')} />
              </Field>

              <Field label="Your email (creates a folder with this name)" hint="The source repo will be copied into a folder named after your email." error={errors.email?.message}>
                <Input type="email" placeholder="you@example.com" {...register('email')} />
              </Field>

              <Btn type="submit" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 size={16} className="spin" style={{ marginRight: '0.5rem' }} /> Copying &amp; deploying…</>
                ) : (
                  <><Rocket size={16} style={{ marginRight: '0.5rem' }} /> Submit — copy &amp; deploy</>
                )}
              </Btn>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        input:focus { outline: 2px solid var(--primary); outline-offset: -2px; }
        a:hover > div { background: #222 !important; }
      `}</style>
    </div>
  )
}

function IconChip({ children }) {
  return (
    <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '0.4rem' }}>
        {label}
      </label>
      {children}
      {error
        ? <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '0.3rem' }}>{error}</p>
        : <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>{hint}</p>
      }
    </div>
  )
}

function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '0.55rem 0.75rem',
        background: 'var(--input-bg)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: 'var(--text)',
        fontSize: '0.9rem',
      }}
    />
  )
}

function Btn({ children, style: extraStyle, ...props }) {
  return (
    <button
      {...props}
      style={{
        width: '100%',
        padding: '0.7rem 1rem',
        background: 'var(--primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontWeight: 500,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.7 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}

function LinkRow({ href, icon, label, url }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1rem', transition: 'background 0.15s' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontSize: '0.875rem', fontWeight: 500 }}>
          {icon} {label}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted)', fontSize: '0.75rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {url.replace('https://', '')}
          <ExternalLink size={12} style={{ flexShrink: 0 }} />
        </span>
      </div>
    </a>
  )
}
