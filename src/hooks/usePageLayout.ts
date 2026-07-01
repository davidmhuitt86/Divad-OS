import { useState, useCallback, useEffect, useMemo, useRef } from 'react'

const STORAGE_KEY = 'divad-layout-v1'
const INACTIVITY_MS = 90_000

export interface PanelState {
  visible: boolean
  order: number
  w?: number
  h?: number
}

type PageData = Record<string, PanelState>
type AllData = Record<string, PageData>

function load(): AllData {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

function persist(d: AllData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {}
}

function normalizePage(page: PageData, panelIds: string[]): PageData {
  const allowed = new Set(panelIds)
  const next: PageData = {}

  panelIds.forEach((id, index) => {
    const existing = page[id]
    next[id] = {
      visible: existing?.visible ?? true,
      order: typeof existing?.order === 'number' ? existing.order : index,
      w: existing?.w,
      h: existing?.h,
    }
  })

  const seen = new Set<number>()
  return Object.fromEntries(
    Object.entries(next)
      .filter(([id]) => allowed.has(id))
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([id, state], index) => {
        const order = seen.has(state.order) ? index : state.order
        seen.add(order)
        return [id, { ...state, order }]
      })
  )
}

export function usePageLayout(pageId: string, panelIds: string[]) {
  const [unlocked, setUnlocked] = useState(false)
  const [sessionShow, setSessionShow] = useState(false)
  const [holdShow, setHoldShow] = useState(false)
  const [dragFrom, setDragFrom] = useState<string | null>(null)
  const [data, setData] = useState<AllData>(load)
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const panelKey = panelIds.join('|')

  useEffect(() => {
    setData(prev => {
      const normalized = normalizePage(prev[pageId] ?? {}, panelIds)
      const next = { ...prev, [pageId]: normalized }
      persist(next)
      return next
    })
  }, [pageId, panelKey])

  const page = useMemo(
    () => normalizePage(data[pageId] ?? {}, panelIds),
    [data, pageId, panelKey]
  )

  const getPanel = useCallback((id: string): PanelState =>
    page[id] ?? { visible: true, order: panelIds.indexOf(id) },
    [page, panelIds]
  )

  const bumpActivity = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    inactivityRef.current = setTimeout(() => setUnlocked(false), INACTIVITY_MS)
  }, [])

  useEffect(() => {
    if (unlocked) {
      bumpActivity()
    } else if (inactivityRef.current) {
      clearTimeout(inactivityRef.current)
    }

    return () => {
      if (inactivityRef.current) clearTimeout(inactivityRef.current)
    }
  }, [unlocked, bumpActivity])

  function mutate(id: string, patch: Partial<PanelState>) {
    setData(prev => {
      const pg = normalizePage(prev[pageId] ?? {}, panelIds)
      pg[id] = { ...getPanel(id), ...patch }
      const next = { ...prev, [pageId]: normalizePage(pg, panelIds) }
      persist(next)
      return next
    })
  }

  const togglePanel = (id: string) => {
    mutate(id, { visible: !getPanel(id).visible })
    bumpActivity()
  }

  const setSize = (id: string, w: number, h: number) => {
    mutate(id, { w, h })
    bumpActivity()
  }

  const fitSize = (id: string) => {
    mutate(id, { w: undefined, h: undefined })
    bumpActivity()
  }

  function swapOrder(a: string, b: string) {
    const oa = getPanel(a).order
    const ob = getPanel(b).order
    setData(prev => {
      const pg = normalizePage(prev[pageId] ?? {}, panelIds)
      pg[a] = { ...getPanel(a), order: ob }
      pg[b] = { ...getPanel(b), order: oa }
      const next = { ...prev, [pageId]: normalizePage(pg, panelIds) }
      persist(next)
      return next
    })
    bumpActivity()
  }

  function showAllPanels() {
    setData(prev => {
      const pg = normalizePage(prev[pageId] ?? {}, panelIds)
      panelIds.forEach((id, i) => { pg[id] = { ...(pg[id] ?? { order: i }), visible: true } })
      const next = { ...prev, [pageId]: normalizePage(pg, panelIds) }
      persist(next)
      return next
    })
    bumpActivity()
  }

  const sorted = [...panelIds].sort((a, b) => getPanel(a).order - getPanel(b).order)
  const hiddenCount = panelIds.filter(id => !getPanel(id).visible).length
  const showAll = sessionShow || holdShow

  return {
    unlocked,
    toggleUnlock: () => setUnlocked(u => !u),
    sessionShow,
    toggleSessionShow: () => {
      setSessionShow(s => !s)
      bumpActivity()
    },
    holdShow,
    setHoldShow,
    showAll,
    dragFrom,
    setDragFrom,
    sorted,
    getPanel,
    isVisible: (id: string) => showAll || getPanel(id).visible,
    togglePanel,
    setSize,
    fitSize,
    swapOrder,
    showAllPanels,
    hiddenCount,
    bumpActivity,
  }
}

export type PageLayout = ReturnType<typeof usePageLayout>
