import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import deployRouter from './routes/deploy.js'

const app = express()
const PORT = process.env.PORT ?? 3001
const isProd = process.env.NODE_ENV === 'production'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api', deployRouter)

// Health check
app.get('/api/healthz', (_req, res) => res.json({ status: 'ok' }))

// Serve built frontend in production
if (isProd) {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const distPath = join(__dirname, '../../client/dist')
  if (existsSync(distPath)) {
    const { default: serveStatic } = await import('serve-static')
    app.use(serveStatic(distPath))
    app.get('*', (_req, res) => {
      res.sendFile(join(distPath, 'index.html'))
    })
  } else {
    console.warn('Production build not found. Run: npm run build')
  }
}

createServer(app).listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
