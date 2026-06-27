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
  on: (channel: string, cb: (...args: unknown[]) => void) => () => void
}

declare global {
  interface Window {
    divadOS: DivadOSApi
  }
}
