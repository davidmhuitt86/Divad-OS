import { contextBridge, ipcRenderer } from 'electron'

const ALLOWED_EVENTS = new Set(['activity:new', 'state:refresh'])

const api = {
  objects: {
    list:    (opts?: { type?: string; status?: string }) => ipcRenderer.invoke('objects:list', opts),
    get:     (id: string) => ipcRenderer.invoke('objects:get', { id }),
    create:  (data: unknown) => ipcRenderer.invoke('objects:create', data),
    update:  (id: string, changes: unknown) => ipcRenderer.invoke('objects:update', { id, ...(changes as object) }),
    approve: (id: string, note?: string) => ipcRenderer.invoke('objects:approve', { id, note }),
    search:  (query: string) => ipcRenderer.invoke('objects:search', { query }),
  },
  activity: {
    list: (limit?: number) => ipcRenderer.invoke('activity:list', { limit }),
  },
  agent: {
    send: (message: string, context?: unknown) => ipcRenderer.invoke('agent:send', { message, context }),
  },
  app: {
    state: () => ipcRenderer.invoke('app:state'),
  },
  graph: {
    snapshot: () => ipcRenderer.invoke('graph:snapshot'),
  },
  config: {
    get: (key: string) => ipcRenderer.invoke('config:get', { key }),
    set: (key: string, value: string) => ipcRenderer.invoke('config:set', { key, value }),
  },
  github: {
    connectTest:  (cfg: unknown) => ipcRenderer.invoke('github:connect-test', cfg),
    sync:         (cfg: unknown) => ipcRenderer.invoke('github:sync', cfg),
    lastSync:     () => ipcRenderer.invoke('github:last-sync'),
    configGet:    () => ipcRenderer.invoke('github:config-get'),
    configSave:   (cfg: unknown) => ipcRenderer.invoke('github:config-save', cfg),
  },
  relationships: {
    list:   (objectId: string) => ipcRenderer.invoke('relationships:list', { objectId }),
    count:  () => ipcRenderer.invoke('relationships:count'),
    create: (sourceId: string, targetId: string, type: string) => ipcRenderer.invoke('relationships:create', { sourceId, targetId, type }),
    delete: (id: string) => ipcRenderer.invoke('relationships:delete', { id }),
  },
  attachments: {
    pick: (): Promise<{ name: string; path: string; size: number; ext: string }[]> =>
      ipcRenderer.invoke('attachments:pick'),
  },
  export: {
    savePdf:  (args: unknown) => ipcRenderer.invoke('export:save-pdf', args),
    saveDocx: (args: unknown) => ipcRenderer.invoke('export:save-docx', args),
    print:    (args: unknown) => ipcRenderer.invoke('export:print', args),
    send:     (args: unknown) => ipcRenderer.invoke('export:send', args),
    history:  (objectId: string) => ipcRenderer.invoke('export:history', { objectId }),
  },
  on: (channel: string, cb: (...args: unknown[]) => void) => {
    if (!ALLOWED_EVENTS.has(channel)) {
      throw new Error(`Unsupported event channel: ${channel}`)
    }
    const handler = (_e: Electron.IpcRendererEvent, ...args: unknown[]) => cb(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },
}

contextBridge.exposeInMainWorld('divadOS', api)
