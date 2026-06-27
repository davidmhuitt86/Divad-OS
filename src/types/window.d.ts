import type { EKEObject, ActivityEvent, AgentMessage, AppState } from '../../shared/types'

interface DivadOSApi {
  objects: {
    list:    (opts?: { type?: string; status?: string }) => Promise<EKEObject[]>
    get:     (id: string) => Promise<EKEObject | null>
    create:  (data: Omit<EKEObject, 'id' | 'created_at' | 'updated_at' | 'revision'>) => Promise<EKEObject>
    update:  (id: string, changes: Partial<EKEObject>) => Promise<EKEObject | null>
    approve: (id: string, note?: string) => Promise<EKEObject | null>
    search:  (query: string) => Promise<EKEObject[]>
  }
  activity: {
    list: (limit?: number) => Promise<ActivityEvent[]>
  }
  agent: {
    send: (message: string, context?: unknown) => Promise<{ success: boolean; message?: AgentMessage; error?: string }>
  }
  app: {
    state: () => Promise<AppState>
  }
  graph: {
    snapshot: () => Promise<{ nodes: EKEObject[]; edges: unknown[] }>
  }
  config: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<void>
  }
  github: {
    connectTest:  (cfg: GitHubCfg) => Promise<{ ok: boolean; error?: string }>
    sync:         (cfg: GitHubCfg) => Promise<{ success: boolean; pushed?: number; pulled?: number; errors?: string[]; syncedAt?: string; error?: string }>
    lastSync:     () => Promise<string | null>
    configGet:    () => Promise<{ url: string | null; branch: string | null }>
    configSave:   (cfg: GitHubCfg) => Promise<{ success: boolean }>
  }
  on: (channel: string, cb: (...args: unknown[]) => void) => () => void
}

interface GitHubCfg {
  url: string
  branch: string
}

declare global {
  interface Window {
    divadOS: DivadOSApi
  }
}
