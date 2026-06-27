import { ipcMain, BrowserWindow } from 'electron'
import {
  listObjects, getObject, createObject, updateObject,
  approveObject, listActivity, getAppState, getGraphSnapshot
} from '../db/queries.js'
import { sendToAgent, initOpenAI } from '../agent/openai.js'

export function registerHandlers(win: BrowserWindow, apiKey: string, assistantId: string) {
  initOpenAI(apiKey, assistantId)

  ipcMain.handle('objects:list', async (_e, { type, status } = {}) => listObjects(type, status))
  ipcMain.handle('objects:get',  async (_e, { id }) => getObject(id))

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

  ipcMain.handle('activity:list', async (_e, { limit } = {}) => listActivity(limit))

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

  ipcMain.handle('objects:search', async (_e, { query }) => {
    const all = await listObjects()
    const q = query.toLowerCase()
    return all.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      o.tags.some((t: string) => t.toLowerCase().includes(q))
    )
  })
}
