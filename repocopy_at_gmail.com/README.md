# Repo Copy & Deploy

Copies a GitHub repository into a named subfolder inside another GitHub repository and deploys that folder live on Vercel. Each new email address creates a new subfolder and a new Vercel deployment without touching previous ones.

## Requirements

- Node.js 20 or later (uses native `fetch` and `--env-file`)
- npm 7 or later (uses workspaces)
- A GitHub Personal Access Token
- A Vercel API Token

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your tokens:

```env
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_...
VERCEL_TOKEN=vcp_...
```

#### Getting a GitHub token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scopes: `repo` (full), and `admin:org` if creating repos under an org
4. Copy the token into `.env`

#### Getting a Vercel token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Copy the token into `.env`

> **Note:** The GitHub token must belong to an account that has write access to the target account/org specified in GitHub URL 2.

### 3. Run in development

```bash
npm run dev
```

This starts:
- React frontend at **http://localhost:3000**
- Express API server at **http://localhost:3001**

### 4. Build and run in production

```bash
npm run build        # builds the React app into client/dist
npm start            # starts the server, which also serves the built frontend
```

Then open **http://localhost:3001**

## How it works

1. Fill in the three fields and click **Submit — copy & deploy**
2. The server:
   - Reads all files from **GitHub URL 1** (source repo)
   - Creates **GitHub URL 2**'s repo if it doesn't exist
   - Commits all source files into a subfolder named after your email
   - Deploys that subfolder to Vercel as a new project
3. You get back a **live Vercel URL** and a **GitHub folder link**

Submitting again with a different email adds another subfolder — previous folders are untouched.

## Project structure

```
repo-copy-deploy/
├── package.json          # root — npm workspaces + concurrently
├── .env                  # your secrets (never commit this)
├── .env.example          # template
├── client/               # React + Vite frontend
│   ├── package.json
│   ├── vite.config.js    # proxies /api → localhost:3001 in dev
│   └── src/
│       └── App.jsx       # the form
└── server/               # Express backend
    ├── package.json
    └── src/
        ├── index.js      # server entry point
        └── routes/
            └── deploy.js # GitHub + Vercel automation
```
