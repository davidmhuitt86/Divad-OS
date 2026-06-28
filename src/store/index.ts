import { create } from 'zustand'
import type { EKEObject, ActivityEvent, AgentMessage, AppState } from '../../shared/types'

const isElectron = typeof window !== 'undefined' && !!window.divadOS

export interface GitHubConfig { url: string; branch: string }

export function isSyncCurrent(lastSync: string | null): boolean {
  if (!lastSync) return false
  return Date.now() - new Date(lastSync).getTime() < 24 * 60 * 60 * 1000
}

interface Store {
  appState: AppState
  loadAppState: () => Promise<void>

  activity: ActivityEvent[]
  loadActivity: () => Promise<void>
  pushActivity: (event: ActivityEvent) => void

  messages: AgentMessage[]
  agentLoading: boolean
  sendMessage: (text: string) => Promise<void>

  objects: EKEObject[]
  loadObjects: (opts?: { type?: string; status?: string }) => Promise<void>

  searchQuery: string
  searchResults: EKEObject[]
  setSearchQuery: (q: string) => void
  runSearch: (q: string) => Promise<void>

  activePage: string
  setActivePage: (page: string) => void

  objectTypeFilter: string | null
  objectStatusFilter: string | null
  navigateToObjects: (type?: string, status?: string) => void
  clearObjectFilters: () => void

  notificationsOpen: boolean
  toggleNotifications: () => void
  closeNotifications: () => void

  userMenuOpen: boolean
  toggleUserMenu: () => void
  closeUserMenu: () => void

  wizardOpen: boolean
  wizardInitialType: string | null
  editingObject: EKEObject | null
  openWizard: (type?: string) => void
  openWizardEdit: (obj: EKEObject) => void
  closeWizard: () => void

  viewingObject: EKEObject | null
  openObject: (obj: EKEObject) => void
  closeObject: () => void

  githubConfig: GitHubConfig | null
  lastSyncAt: string | null
  isSyncing: boolean
  syncError: string | null
  isOffline: boolean
  loadGitHubConfig: () => Promise<void>
  saveGitHubConfig: (cfg: GitHubConfig) => Promise<void>
  triggerSync: () => Promise<{ success: boolean; pushed?: number; pulled?: number; errors?: string[] }>
  checkConnectivity: () => Promise<void>
  loadLastSync: () => Promise<void>
}

export const useStore = create<Store>((set, get) => ({
  appState: {
    currentAP: null, currentAPO: null, currentAPT: null,
    currentMIT: null, mission: 'Build the Engineering Knowledge Engine',
  },
  loadAppState: async () => {
    if (!isElectron) return
    const state = await window.divadOS.app.state()
    set({ appState: state })
  },

  activity: [],
  loadActivity: async () => {
    if (!isElectron) return
    const events = await window.divadOS.activity.list(50)
    set({ activity: events })
  },
  pushActivity: (event) => set(s => ({ activity: [event, ...s.activity].slice(0, 50) })),

  messages: [],
  agentLoading: false,
  sendMessage: async (text) => {
    if (!isElectron) return
    set(s => ({
      messages: [...s.messages, { id: Date.now().toString(), role: 'user', content: text, created_at: new Date().toISOString() }],
      agentLoading: true,
    }))
    const result = await window.divadOS.agent.send(text)
    if (result.success && result.message) {
      set(s => ({ messages: [...s.messages, result.message!], agentLoading: false }))
      get().loadAppState()
    } else {
      set(s => ({
        messages: [...s.messages, { id: Date.now().toString(), role: 'assistant', content: `Error: ${result.error}`, created_at: new Date().toISOString() }],
        agentLoading: false,
      }))
    }
  },

  objects: [],
  loadObjects: async (opts) => {
    if (!isElectron) return
    const list = await window.divadOS.objects.list(opts)
    set({ objects: list })
  },

  searchQuery: '',
  searchResults: [],
  setSearchQuery: (q) => set({ searchQuery: q }),
  runSearch: async (q) => {
    if (!isElectron || !q.trim()) { set({ searchResults: [] }); return }
    const results = await window.divadOS.objects.search(q)
    set({ searchResults: results })
  },

  activePage: 'home',
  setActivePage: (page) => set({ activePage: page }),

  objectTypeFilter: null,
  objectStatusFilter: null,
  navigateToObjects: (type, status) => set({ activePage: 'objects', objectTypeFilter: type ?? null, objectStatusFilter: status ?? null }),
  clearObjectFilters: () => set({ objectTypeFilter: null, objectStatusFilter: null }),

  notificationsOpen: false,
  toggleNotifications: () => set(s => ({ notificationsOpen: !s.notificationsOpen, userMenuOpen: false })),
  closeNotifications: () => set({ notificationsOpen: false }),

  userMenuOpen: false,
  toggleUserMenu: () => set(s => ({ userMenuOpen: !s.userMenuOpen, notificationsOpen: false })),
  closeUserMenu: () => set({ userMenuOpen: false }),

  wizardOpen: false,
  wizardInitialType: null,
  editingObject: null,
  openWizard: (type) => set({ wizardOpen: true, wizardInitialType: type ?? null, editingObject: null }),
  openWizardEdit: (obj) => set({ wizardOpen: true, wizardInitialType: obj.type, editingObject: obj }),
  closeWizard: () => set({ wizardOpen: false, wizardInitialType: null, editingObject: null }),

  viewingObject: null,
  openObject: (obj) => set({ viewingObject: obj }),
  closeObject: () => set({ viewingObject: null }),

  githubConfig: null,
  lastSyncAt: null,
  isSyncing: false,
  syncError: null,
  isOffline: false,

  loadGitHubConfig: async () => {
    if (!isElectron) return
    const cfg = await window.divadOS.github.configGet()
    if (cfg.url && cfg.branch) {
      set({ githubConfig: { url: cfg.url, branch: cfg.branch } })
    }
  },

  saveGitHubConfig: async (cfg) => {
    if (!isElectron) return
    await window.divadOS.github.configSave(cfg)
    set({ githubConfig: cfg })
  },

  triggerSync: async () => {
    const { githubConfig } = get()
    if (!isElectron || !githubConfig) return { success: false }
    set({ isSyncing: true, syncError: null })
    try {
      const result = await window.divadOS.github.sync(githubConfig)
      if (result.success) {
        set({ lastSyncAt: result.syncedAt ?? new Date().toISOString(), isSyncing: false })
        await get().loadObjects()
        return { success: true, pushed: result.pushed, pulled: result.pulled, errors: result.errors }
      } else {
        set({ syncError: result.error ?? 'Sync failed', isSyncing: false })
        return { success: false }
      }
    } catch (e: unknown) {
      set({ syncError: String(e), isSyncing: false })
      return { success: false }
    }
  },

  checkConnectivity: async () => {
    const { githubConfig } = get()
    if (!isElectron || !githubConfig) { set({ isOffline: false }); return }
    const result = await window.divadOS.github.connectTest(githubConfig)
    set({ isOffline: !result.ok })
  },

  loadLastSync: async () => {
    if (!isElectron) return
    const ts = await window.divadOS.github.lastSync()
    set({ lastSyncAt: ts })
  },
}))
