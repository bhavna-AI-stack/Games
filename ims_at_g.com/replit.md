# Internship Management Portal

## Overview

This is an internship management portal for EtherAuthority, a blockchain security company. The application allows prospective interns to submit applications through a public-facing landing page, while administrators can review, manage, and export applicant data through a protected dashboard.

The portal features a modern landing page with hero section, benefits, and requirements sections, an application form with CV upload capability, and a full admin dashboard for managing intern applications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for Replit environment
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming (light/dark mode)
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Design**: RESTful API endpoints under `/api/` prefix
- **Session Management**: Express session with connect-pg-simple for PostgreSQL session storage
- **File Uploads**: Multer for CV file handling (PDF, DOC, DOCX up to 5MB)
- **Authentication**: Simple session-based admin authentication with environment variable credentials

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM for all data (interns, tasks, projects, exams, notifications, etc.)
- **Schema Definition**: Drizzle ORM with shared schemas in `shared/schema.ts`
- **File Storage**: Local filesystem storage in `uploads/` directory for CV files

### Key Design Decisions

1. **PostgreSQL for Everything**: All data is stored in PostgreSQL using Drizzle ORM — intern applications, admin sessions, tasks, projects, exams, weekly updates, time logs, and notifications.

2. **Monorepo Structure**: Client, server, and shared code coexist in a single repository with clear separation:
   - `client/` - React frontend
   - `server/` - Express backend
   - `shared/` - Shared TypeScript types and Zod schemas

3. **Component Architecture**: Feature components in `client/src/components/` with UI primitives in `client/src/components/ui/`. Example components provided in `client/src/components/examples/` for development reference.

4. **Build Process**: Custom build script (`script/build.ts`) bundles server dependencies to reduce cold start times, with specific allowlist for bundled packages.

## Intern Panel Features

### Qualification Paths
- **Course Program** (`course_first`): 4-week training with 40 modules across Web3, DeFi, Security, and AI
- **Entrance Test** (`entrance_test`): Take an exam or select from demo/test projects

### Project Category System
- Admin creates projects with categories: DAO, Test Project, Interns Project, Internal, Client, Research
- Projects shown to interns are filtered by category based on their stage:
  - **Test/Training phase** (pending, training, testing, training_complete): Shows "Test Project" category projects
  - **Internship phase** (internship): Shows "Interns Project" category projects
  - **DAO phase** (completed + DAO approved): Shows "Interns Project" + "DAO" category projects, plus ability to create own projects
- The `/api/intern/demo-projects` endpoint returns `adminProjects` filtered by the intern's current status

### Wallet Address Submission
- When interns reach `internship` or `completed` status, a popup automatically appears to submit their MetaMask wallet address for SCAi token stipend
- Validates Ethereum address format (0x + 40 hex chars)
- Stores in `interns.walletAddress` column
- Admin can view all submitted wallet addresses at `/admin/wallet-addresses`
- Components: `WalletSubmitPopup.tsx` (intern popup), `WalletAddresses.tsx` (admin module)
- API: `GET/POST /api/intern/wallet`, `GET /api/admin/wallet-addresses`

### Internship Flow
1. Application with qualification path selection
2. Training course / entrance test completion
3. Terms & Conditions acceptance
4. Offer Letter generation
5. 1-month internship
6. Internship completion certificate
7. DAO membership application (dedicated page with form: position, work availability, expertise)

### Intern Categories & Subcategories
- `intern_categories` - Training categories (e.g. Web Development, Blockchain & Web3, AI & Automation, Digital Marketing, UI/UX Design, Business Development)
- `intern_subcategories` - Subcategories within each category (e.g. Smart Contract Development under Blockchain & Web3)
- `course_topics` - Course topics per category (displayed on front page Training Courses section)
  - Fields: `id`, `categoryId`, `name`, `sortOrder`, `isActive`, `createdAt`
  - Admin CRUD at `/api/admin/course-topics`; public API at `/api/categories-with-topics`
  - Admin manages topics within CategoryManagement.tsx (expandable per category)
- `interns.categoryId` / `interns.subcategoryId` - Optional category selection on application
- Admin manages categories via `/admin/categories` page (CRUD, toggle active/inactive, course topics)
- Application form includes category/subcategory dropdowns (subcategory populates based on selected category)
- Front page AboutProgramSection dynamically displays categories with their course topics (fetched from API)
- Component: `client/src/components/admin/CategoryManagement.tsx`

### Social Follow Page
- Interns can confirm following EtherAuthority on 5 social platforms: Twitter/X, Telegram, YouTube, GitHub, Facebook
- Progress tracker shows X / 5 tasks completed with a progress bar
- Each platform card has: icon, badge, title, description, external link, and confirm button
- Confirmed follows turn into green "Completed" badges
- DB table: `social_follows` with unique constraint on `(intern_id, platform)`
- API: `GET/POST /api/intern/social-follows`
- Component: `client/src/components/intern/InternSocialModule.tsx`
- Nav: Sidebar item "Social Follow" (Share2 icon) between Certificates and Terms & Conditions

### New Database Tables
- `social_follows` - Tracks which social platforms each intern has followed (unique per intern+platform)
- `course_modules` - 40 training modules organized by week (1-4)
- `course_progress` - Per-intern module completion tracking
- `certificates` - Generated certificates (training/internship/offer_letter) with certificate_number, intern_name, program dates
- `demo_projects` - 5 predefined demo project options
- `intern_demo_projects` - Intern's selected project + status
- `internship_project_tasks` - 7-phase project work subtasks (checkbox completion tracking per selected project)

### Internship Project Work Flow
- Interns select up to 2 projects from demo_projects during internship phase
- Each project has 7 phases with subtasks (auto-initialized on first access):
  1. Select Project (1 subtask)
  2. Development & Testing (3 subtasks)
  3. Optimization & Bug Fix (3 subtasks)
  4. Deployment (2 subtasks)
  5. Publish Project (2 subtasks)
  6. DApp Deployment (1 subtask)
  7. Final Submission (4 subtasks)
- Each project completed = 50% progress, 2 projects = 100%
- At 100%: unlock internship completion certificate + DAO membership application
- `termsAcceptedAt` column stores when T&C was accepted

### Task-Module Linking (Course Program Path)
- Tasks have a `courseModuleId` field linking them to training modules
- When an intern clicks "Start Task" in the Training Module, a task is auto-created linked to that course module
- Tasks can be started/stopped (time tracking) and submitted with notes, description, and GitHub link
- When a task linked to a course module is submitted as "completed", the module is automatically marked complete
- Progress bar and module status update automatically in real-time
- Weeks are unlocked sequentially — complete all modules in Week N to unlock Week N+1
- Tasks also store `submittedNotes` and `submittedGithubLink` for submission details

### Direct Exam (Course-First Shortcut)
- `course_first` interns can skip Weeks 1-3 and go directly to Week 4 final project modules
- `/intern/direct-exam` - Shows only Week 4 modules filtered by intern's category
- API endpoints: `GET /api/intern/direct-exam/modules`, `GET /api/intern/direct-exam/progress` (both guarded to `course_first` path only)
- Auto-advance: completing all Week 4 modules sets status to `training_complete`
- Certificate eligibility: either full course completion OR Week 4 direct exam completion qualifies
- Storage methods: `getWeek4Modules(categoryId)`, `getWeek4Progress(internId)`
- Sidebar nav item with Zap icon, "Direct Exam" button on dashboard overview

### New Intern Dashboard Pages
- `/intern/training` - Course training modules with task-based progress tracking
- `/intern/direct-exam` - Direct exam (Week 4 only) for course-first interns
- `/intern/test-path` - Entrance test and demo project selection
- `/intern/certificates` - Certificate generation and download
- `/intern/terms` - Terms & Conditions acceptance + Offer Letter
- `/intern/dao-membership` - DAO application form (position, work availability, expertise); shows after internship completion
- `/intern/dao-projects` - DAO member project management (create own projects, visible only to approved DAO members)

### DAO Member Features
- Approved DAO members can create their own projects via `/api/intern/dao/projects`
- Projects created by DAO interns have `createdByInternId` set in the `projects` table
- DAO projects appear in the task creation dialog with "(My Project)" label
- DAO interns can create tasks, assign them to their own projects, start/stop/submit tasks

### Auto-Approval
- All applicants are auto-approved on application submission (user account created with default password "123456" and `isApproved = 1`)
- Admin approval step removed from UI; Intern Approval page shows all applicants as "Auto-Approved"

### Intern Status Values
`pending` → `training` → `training_complete` → `internship` → `completed`

### Intern Categories System
- **Tables**: `intern_categories` (5 categories: Web3+AI, Digital Marketing, Graphics Design, Business Development, DAO) and `intern_subcategories` (13 subcategories)
- **Fixed UUIDs**: Web3+AI=`f90cf240-...`, Business Development=`98e7d6e1-...`, DAO=`ff79379f-...`, Digital Marketing=`8844070f-...`, Graphics Design=`5901c219-...`
- **FK column**: `intern_category_id` (UUID, nullable) added to `course_modules`, `exams`, `projects`, `demo_projects`, `interns`
- **Category filtering**: Training modules, progress summary, and course content are filtered by intern's category (category-specific + global modules where `intern_category_id IS NULL`)
- **Category display**: Category column in admin TrainingModule and TaskManagement tables; category badge on intern Profile page; category badge on intern Projects header
- **Dynamic certificate text**: Certificates (training, offer letter, internship, completion letter) use the intern's category to dynamically set role title, program name, and description text via `CATEGORY_CERT_TEXT` mapping in `InternCertificatesModule.tsx`
- **Admin UI**: CategoryManagement CRUD, category dropdowns in ExamManagement and ProjectManagement, category badges in InternList
- **Exam API contract**: Exam endpoints use snake_case field names (`duration_minutes`, `total_marks`, `intern_category_id`, etc.) — the GET/PUT responses map Drizzle camelCase to snake_case for frontend consistency
- **Application form**: Category and subcategory dropdowns, subcategory populates dynamically based on selected category
- **Admin Course Module Management**: Full CRUD via `/api/admin/course-modules` routes + `CourseModuleManagement` component (add/edit/delete modules with week number, type, intern category, order index). Accessible from admin sidebar under "Course Modules". 15 items per page pagination.
- **QueryClient**: Single shared `QueryClient` instance in `client/src/lib/queryClient.ts` with a default `queryFn` that auto-fetches from the URL in `queryKey[0]`. Used by both `App.tsx` and all component invalidations.

### Video Management Module
- **Table**: `videos` (id, title, description, video_url, thumbnail_url, category_id FK to intern_categories, video_type, is_active, created_at)
- **Video Types**: `training`, `internship`, `dao`
- **Admin UI**: `VideoManagement.tsx` — full CRUD with search, filter by type/category, toggle active/inactive
- **API Routes**: `/api/admin/videos` (GET all, POST create), `/api/admin/videos/:id` (GET, PATCH, DELETE), `/api/admin/videos/category/:categoryId`, `/api/admin/videos/type/:videoType`
- **Sidebar**: "Videos" nav item with Video icon, accessible at `/admin/videos`

### Sub-Project Module
- **Tables**: `sub_projects` (id, name, description, category, repository_url, website_url, intern_category_id FK, created_at), `intern_sub_projects` (intern_id, sub_project_id, status, completed_at), `sub_project_tasks` (intern_id, intern_sub_project_id, phase_number, phase_name, subtask_name, completed, completed_at)
- **Admin UI**: `SubProjectManagement.tsx` — full CRUD with search, category/intern-category assignment
- **API Routes**: `/api/admin/sub-projects` (GET all, POST create), `/api/admin/sub-projects/:id` (PATCH, DELETE)
- **Intern Routes**: `/api/intern/sub-projects` (GET available + selected), `/api/intern/sub-projects/select` (POST), `/api/intern/sub-project-tasks/:id` (GET tasks), `/api/intern/sub-project-tasks/:taskId/toggle` (PATCH)
- **Progress Calculation**: Main projects = 50% each, Sub-projects = 25% each, capped at 100%. Formula: `min(100, completedMain*50 + completedSub*25)`
- **Task Template**: 4 phases (Setup & Planning, Development, Testing & Review, Submission) with 2 subtasks each, auto-initialized on first access
- **Sidebar**: "Sub-Projects" nav item with Layers icon, accessible at `/admin/sub-projects`

## External Dependencies

### Database Services
- **PostgreSQL**: Primary data store for all application data (connection via `DATABASE_URL` environment variable)

### Email Service
- **Nodemailer**: SMTP-based email sending for application confirmations and admin notifications
- Configuration via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` environment variables

### Third-Party Libraries
- **ExcelJS**: Excel file generation for exporting intern data
- **Multer**: Multipart form handling for file uploads
- **Zod**: Schema validation shared between client and server

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URI` - MongoDB connection string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Admin dashboard credentials
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration (optional)