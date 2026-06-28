import { ipcMain, BrowserWindow } from 'electron'
import {
  listObjects, getObject, createObject, updateObject,
  approveObject, listActivity, getAppState, getGraphSnapshot,
  getConfig, setConfig,
  createRelationship, listRelationships, deleteRelationship, countAllRelationships,
} from '../db/queries.js'
import { sendToAgent, initOpenAI } from '../agent/openai.js'
import { testConnection, performSync } from '../github/sync.js'

export function registerHandlers(win: BrowserWindow, apiKey: string, assistantId: string) {
  initOpenAI(apiKey, assistantId)

  ipcMain.handle('objects:list',   async (_e, { type, status } = {}) => listObjects(type, status))
  ipcMain.handle('objects:get',    async (_e, { id }) => getObject(id))

  ipcMain.handle('objects:create', async (_e, data) => {
    const obj = await createObject(data)
    const [latest] = await listActivity(1)
    win.webContents.send('activity:new', latest)
    win.webContents.send('state:refresh')
    return obj
  })

  ipcMain.handle('objects:update', async (_e, { id, ...changes }) => {
    const obj = await updateObject(id, changes)
    const [latest] = await listActivity(1)
    win.webContents.send('activity:new', latest)
    win.webContents.send('state:refresh')
    return obj
  })

  ipcMain.handle('objects:approve', async (_e, { id, note }) => {
    const obj = await approveObject(id, note)
    const [latest] = await listActivity(1)
    win.webContents.send('activity:new', latest)
    win.webContents.send('state:refresh')
    return obj
  })

  ipcMain.handle('objects:search', async (_e, { query }) => {
    const all = await listObjects()
    const q = query.toLowerCase()
    return all.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      o.tags.some((t: string) => t.toLowerCase().includes(q))
    )
  })

  ipcMain.handle('activity:list', async (_e, { limit } = {}) => listActivity(limit))

  // Relationships
  ipcMain.handle('relationships:list',   async (_e, { objectId }) => listRelationships(objectId))
  ipcMain.handle('relationships:count',  async () => countAllRelationships())
  ipcMain.handle('relationships:create', async (_e, { sourceId, targetId, type }) => {
    const rel = await createRelationship(sourceId, targetId, type)
    win.webContents.send('state:refresh')
    return rel
  })
  ipcMain.handle('relationships:delete', async (_e, { id }) => {
    await deleteRelationship(id)
    win.webContents.send('state:refresh')
  })

  ipcMain.handle('agent:send', async (_e, { message, context }) => {
    try {
      const reply = await sendToAgent(message, context)
      const [latest] = await listActivity(1)
      win.webContents.send('activity:new', latest)
      win.webContents.send('state:refresh')
      return { success: true, message: reply }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('app:state',      async () => getAppState())
  ipcMain.handle('graph:snapshot', async () => getGraphSnapshot())

  ipcMain.handle('config:get', async (_e, { key }) => getConfig(key))
  ipcMain.handle('config:set', async (_e, { key, value }) => { await setConfig(key, value) })

  // GitHub
  ipcMain.handle('github:connect-test', async (_e, cfg) => testConnection(cfg))

  ipcMain.handle('github:sync', async (_e, cfg) => {
    const objects = await listObjects()
    return performSync(cfg, objects)
  })

  ipcMain.handle('github:last-sync', async () => getConfig('github_last_sync'))

  ipcMain.handle('github:config-get', async () => ({
    url:    await getConfig('github_url'),
    branch: await getConfig('github_branch'),
  }))

  ipcMain.handle('github:config-save', async (_e, { url, branch }) => {
    await setConfig('github_url', url)
    await setConfig('github_branch', branch)
    return { success: true }
  })
}
