import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import { registerHandlers } from './ipc/handlers.js'

interface EnvConfig {
  apiKey: string
  assistantId: string
}

function loadEnvConfig(): EnvConfig {
  const candidates = [
    path.join(app.getAppPath(), '.env'),
    path.join(app.getAppPath(), 'openaiassistantkey.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'openaiassistantkey.env'),
  ]

  for (const p of candidates) {
    if (!fs.existsSync(p)) continue
    const content = fs.readFileSync(p, 'utf-8')
    const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))

    let apiKey = ''
    let assistantId = ''

    for (const line of lines) {
      if (line.startsWith('OPENAI_API_KEY=')) apiKey = line.slice('OPENAI_API_KEY='.length).trim()
      else if (line.startsWith('OPENAI_ASSISTANT_ID=')) assistantId = line.slice('OPENAI_ASSISTANT_ID='.length).trim()
      // Support bare key on first line (legacy format)
      else if (!apiKey && line.startsWith('sk-')) apiKey = line.trim()
    }

    if (apiKey) return { apiKey, assistantId }
  }

  throw new Error('OpenAI API key not found. Add OPENAI_API_KEY to your .env file.')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0d0f14',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0d0f14',
      symbolColor: '#94a3b8',
      height: 32,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const config = loadEnvConfig()
  registerHandlers(win, config.apiKey, config.assistantId)

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
