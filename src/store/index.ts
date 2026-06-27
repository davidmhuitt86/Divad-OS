import { create } from 'zustand'
import type { EKEObject, ActivityEvent, AgentMessage, AppState } from '../../shared/types'

const isElectron = typeof window !== 'undefined' && !!window.divadOS

interface Store {
  // App state (AP/APO/APT/MIT/mission)
  appState: AppState
  loadAppState: () => Promise<void>

  // Activity feed
  activity: ActivityEvent[]
  loadActivity: () => Promise<void>
  pushActivity: (event: ActivityEvent) => void

  // Agent chat
  messages: AgentMessage[]
  agentLoading: boolean
  sendMessage: (text: string) => Promise<void>

  // Objects cache
  objects: EKEObject[]
  loadObjects: (opts?: { type?: string; status?: string }) => Promise<void>

  // Search
  searchQuery: string
  searchResults: EKEObject[]
  setSearchQuery: (q: string) => void
  runSearch: (q: string) => Promise<void>

  // Nav
  activePage: string
  setActivePage: (page: string) => void
}

export const useStore = create<Store>((set, get) => ({
  appState: {
    currentAP: null,
    currentAPO: null,
    currentAPT: null,
    currentMIT: null,
    mission: 'Build the Engineering Knowledge Engine',
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
}))
