import { Router } from 'express'
import { z } from 'zod'

const router = Router()

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.avif',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp4', '.mp3', '.wav', '.ogg', '.flac', '.aac',
  '.pdf', '.zip', '.tar', '.gz', '.bz2', '.7z',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.db', '.sqlite', '.sqlite3',
  '.pyc', '.class', '.o', '.a',
])

function isBinary(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
  return BINARY_EXTENSIONS.has(ext)
}

function parseGitHubUrl(raw) {
  const cleaned = raw.replace(/\.git\/?$/, '').replace(/\/$/, '')
  const match = cleaned.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/)
  if (!match) throw new Error(`Invalid GitHub URL: ${raw}`)
  return { owner: match[1], repo: match[2] }
}

function sanitizeFolderName(email) {
  return email.replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_')
}

const bodySchema = z.object({
  sourceUrl: z.string().url(),
  targetUrl: z.string().url(),
  email: z.string().email(),
})

async function ghFetch(url, token, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
}

router.post('/deploy', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  const { sourceUrl, targetUrl, email } = parsed.data
  const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  const vercelToken = process.env.VERCEL_TOKEN

  if (!githubToken) return res.status(500).json({ error: 'GITHUB_PERSONAL_ACCESS_TOKEN is not set in .env' })
  if (!vercelToken) return res.status(500).json({ error: 'VERCEL_TOKEN is not set in .env' })

  try {
    const source = parseGitHubUrl(sourceUrl)
    const target = parseGitHubUrl(targetUrl)
    const folderName = sanitizeFolderName(email)

    // ── 1. Source repo default branch ─────────────────────────────────────
    const srcRepoResp = await ghFetch(`https://api.github.com/repos/${source.owner}/${source.repo}`, githubToken)
    if (!srcRepoResp.ok) {
      const e = await srcRepoResp.json()
      throw new Error(`Cannot access source repo: ${e.message ?? srcRepoResp.status}`)
    }
    const srcRepo = await srcRepoResp.json()
    const srcBranch = srcRepo.default_branch

    // ── 2. Recursive source file tree ─────────────────────────────────────
    const treeResp = await ghFetch(
      `https://api.github.com/repos/${source.owner}/${source.repo}/git/trees/${srcBranch}?recursive=1`,
      githubToken
    )
    if (!treeResp.ok) throw new Error('Failed to fetch source repo tree')
    const treeData = await treeResp.json()
    const blobs = treeData.tree.filter(f => f.type === 'blob' && (f.size ?? 0) < 500_000)

    if (blobs.length === 0) throw new Error('Source repo appears empty or all files exceed the 500 KB per-file limit.')

    // ── 3. Create target repo if it doesn't exist ─────────────────────────
    const targetExistsResp = await ghFetch(`https://api.github.com/repos/${target.owner}/${target.repo}`, githubToken)
    if (!targetExistsResp.ok) {
      const meResp = await ghFetch('https://api.github.com/user', githubToken)
      const me = await meResp.json()
      const createUrl = me.login.toLowerCase() === target.owner.toLowerCase()
        ? 'https://api.github.com/user/repos'
        : `https://api.github.com/orgs/${target.owner}/repos`

      const createResp = await ghFetch(createUrl, githubToken, {
        method: 'POST',
        body: JSON.stringify({ name: target.repo, private: false, auto_init: true, description: 'Created by Repo Copy & Deploy' }),
      })
      if (!createResp.ok) {
        const e = await createResp.json()
        throw new Error(`Could not create target repo: ${e.message ?? createResp.status}`)
      }
      await new Promise(r => setTimeout(r, 3000))
    }

    // ── 4. Target repo HEAD + base tree ───────────────────────────────────
    const tgtRepoResp = await ghFetch(`https://api.github.com/repos/${target.owner}/${target.repo}`, githubToken)
    if (!tgtRepoResp.ok) throw new Error('Cannot access target repo after creation.')
    const tgtRepo = await tgtRepoResp.json()
    const tgtBranch = tgtRepo.default_branch

    const refResp = await ghFetch(
      `https://api.github.com/repos/${target.owner}/${target.repo}/git/ref/heads/${tgtBranch}`,
      githubToken
    )
    if (!refResp.ok) throw new Error('Cannot read target repo HEAD ref.')
    const refData = await refResp.json()
    const headSha = refData.object.sha

    const headCommitResp = await ghFetch(
      `https://api.github.com/repos/${target.owner}/${target.repo}/git/commits/${headSha}`,
      githubToken
    )
    const headCommit = await headCommitResp.json()
    const baseTreeSha = headCommit.tree.sha

    // ── 5. Fetch blob contents from source ────────────────────────────────
    const vercelFiles = []
    const ghTreeItems = []

    for (const blob of blobs) {
      const blobResp = await ghFetch(
        `https://api.github.com/repos/${source.owner}/${source.repo}/git/blobs/${blob.sha}`,
        githubToken
      )
      if (!blobResp.ok) continue
      const blobData = await blobResp.json()
      const rawBase64 = blobData.content.replace(/\n/g, '')

      // Vercel: always base64
      vercelFiles.push({ file: blob.path, data: rawBase64, encoding: 'base64' })

      if (isBinary(blob.path)) {
        // Binary: create blob in target repo, reference by SHA
        const newBlobResp = await ghFetch(
          `https://api.github.com/repos/${target.owner}/${target.repo}/git/blobs`,
          githubToken,
          { method: 'POST', body: JSON.stringify({ content: rawBase64, encoding: 'base64' }) }
        )
        if (!newBlobResp.ok) continue
        const newBlob = await newBlobResp.json()
        ghTreeItems.push({ path: `${folderName}/${blob.path}`, mode: '100644', type: 'blob', sha: newBlob.sha })
      } else {
        const text = Buffer.from(rawBase64, 'base64').toString('utf-8')
        ghTreeItems.push({ path: `${folderName}/${blob.path}`, mode: '100644', type: 'blob', content: text })
      }
    }

    // ── 6. Create tree in target ──────────────────────────────────────────
    const newTreeResp = await ghFetch(
      `https://api.github.com/repos/${target.owner}/${target.repo}/git/trees`,
      githubToken,
      { method: 'POST', body: JSON.stringify({ base_tree: baseTreeSha, tree: ghTreeItems }) }
    )
    if (!newTreeResp.ok) {
      const e = await newTreeResp.json()
      throw new Error(`Failed to create Git tree: ${e.message ?? newTreeResp.status}`)
    }
    const newTree = await newTreeResp.json()

    // ── 7. Commit ─────────────────────────────────────────────────────────
    const commitResp = await ghFetch(
      `https://api.github.com/repos/${target.owner}/${target.repo}/git/commits`,
      githubToken,
      {
        method: 'POST',
        body: JSON.stringify({
          message: `Add ${folderName} (copied from ${source.owner}/${source.repo})`,
          tree: newTree.sha,
          parents: [headSha],
        }),
      }
    )
    if (!commitResp.ok) throw new Error('Failed to create commit.')
    const commit = await commitResp.json()

    // ── 8. Update branch ref ──────────────────────────────────────────────
    const updateRefResp = await ghFetch(
      `https://api.github.com/repos/${target.owner}/${target.repo}/git/refs/heads/${tgtBranch}`,
      githubToken,
      { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) }
    )
    if (!updateRefResp.ok) throw new Error('Failed to update branch ref.')

    const githubUrl = `https://github.com/${target.owner}/${target.repo}/tree/${tgtBranch}/${folderName}`

    // ── 9. Deploy to Vercel ───────────────────────────────────────────────
    const projectName = `${target.repo}-${folderName}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 52)

    const vercelResp = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        files: vercelFiles,
        projectSettings: { framework: null },
        target: 'production',
      }),
    })

    if (!vercelResp.ok) {
      const e = await vercelResp.json()
      throw new Error(`Vercel deployment failed: ${e.error?.message ?? vercelResp.status}`)
    }

    const vercelData = await vercelResp.json()
    const vercelUrl = `https://${vercelData.url}`

    return res.json({ vercelUrl, githubUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
    console.error('[deploy]', err)
    return res.status(500).json({ error: message })
  }
})

export default router
