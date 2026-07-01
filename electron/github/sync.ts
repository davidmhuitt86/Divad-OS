import { execFile } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'

const execFileAsync = promisify(execFile)

export interface GitHubCfg {
  url: string
  branch: string
}

function repoLocalPath(url: string): string {
  const slug = url.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase()
  return path.join(app.getPath('userData'), 'repo-cache', slug)
}

function errorMessage(e: unknown): string {
  const err = e as { stderr?: string | Buffer; message?: string }
  const stderr = Buffer.isBuffer(err.stderr) ? err.stderr.toString('utf8') : err.stderr
  return (stderr ?? err.message ?? String(e)).trim().split('\n')[0]
}

async function git(args: string[], cwd?: string): Promise<{ stdout: string; stderr: string }> {
  const { stdout, stderr } = await execFileAsync('git', args, {
    cwd,
    timeout: 30000,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 10,
  })
  return {
    stdout: Buffer.isBuffer(stdout) ? stdout.toString('utf8') : stdout,
    stderr: Buffer.isBuffer(stderr) ? stderr.toString('utf8') : stderr,
  }
}

export async function testConnection(cfg: GitHubCfg): Promise<{ ok: boolean; error?: string }> {
  try {
    await git(['ls-remote', '--heads', cfg.url])
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: errorMessage(e) }
  }
}

export interface SyncResult {
  success: boolean
  pushed: number
  pulled: number
  errors: string[]
  syncedAt?: string
  error?: string
}

export async function performSync(cfg: GitHubCfg, objects: unknown[]): Promise<SyncResult> {
  const localPath = repoLocalPath(cfg.url)
  const errors: string[] = []
  let pushed = 0
  let pulled = 0

  try {
    // Clone or pull
    if (!fs.existsSync(path.join(localPath, '.git'))) {
      fs.mkdirSync(localPath, { recursive: true })
      await git(['clone', '--branch', cfg.branch, cfg.url, '.'], localPath)
    } else {
      await git(['fetch', 'origin'], localPath)
      try {
        await git(['checkout', cfg.branch], localPath)
        await git(['pull', '--rebase', 'origin', cfg.branch], localPath)
      } catch {
        await git(['reset', '--hard', `origin/${cfg.branch}`], localPath)
      }
    }
    pulled = 1 // pulled remote changes

    // Write local objects as JSON files
    const objectsDir = path.join(localPath, 'objects')
    fs.mkdirSync(objectsDir, { recursive: true })

    for (const obj of objects as Array<Record<string, unknown>>) {
      const typeDir = path.join(objectsDir, String(obj.type))
      fs.mkdirSync(typeDir, { recursive: true })
      fs.writeFileSync(
        path.join(typeDir, `${obj.id}.json`),
        JSON.stringify(obj, null, 2),
        'utf8'
      )
      pushed++
    }

    // Write sync manifest
    const syncDir = path.join(localPath, '_sync')
    fs.mkdirSync(syncDir, { recursive: true })
    const syncedAt = new Date().toISOString()
    fs.writeFileSync(
      path.join(syncDir, 'manifest.json'),
      JSON.stringify({ syncedAt, objectCount: objects.length }, null, 2),
      'utf8'
    )

    // Commit and push
    await git(['add', '-A'], localPath)
    const { stdout: status } = await git(['status', '--porcelain'], localPath)
    if (status.trim()) {
      await git(['-c', 'user.email=divad-os@local', '-c', 'user.name=Divad OS', 'commit', '-m', `sync: ${new Date().toLocaleString()}`], localPath)
      await git(['push', 'origin', cfg.branch], localPath)
    }

    return { success: true, pushed, pulled, errors, syncedAt }
  } catch (e: unknown) {
    errors.push(errorMessage(e))
    return { success: false, pushed, pulled, errors, error: errors[0] }
  }
}
