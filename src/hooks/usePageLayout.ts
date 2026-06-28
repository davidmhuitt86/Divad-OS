import { useState, useCallback } from 'react'

const STORAGE_KEY = 'divad-layout-v1'

export interface PanelState {
  visible: boolean
  order: number
  w?: number
  h?: number
}

type PageData = Record<string, PanelState>
type AllData  = Record<string, PageData>

function load(): AllData {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}
function persist(d: AllData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {}
}

export function usePageLayout(pageId: string, panelIds: string[]) {
  const [unlocked,    setUnlocked]    = useState(false)
  const [sessionShow, setSessionShow] = useState(false)
  const [holdShow,    setHoldShow]    = useState(false)
  const [dragFrom,    setDragFrom]    = useState<string | null>(null)
  const [data,        setData]        = useState<AllData>(load)

  const page = data[pageId] ?? {}

  const getPanel = useCallback((id: string): PanelState =>
    page[id] ?? { visible: true, order: panelIds.indexOf(id) },
    [page, panelIds]
  )

  function mutate(id: string, patch: Partial<PanelState>) {
    setData(prev => {
      const pg   = { ...(prev[pageId] ?? {}) }
      pg[id]     = { ...getPanel(id), ...patch }
      const next = { ...prev, [pageId]: pg }
      persist(next)
      return next
    })
  }

  const togglePanel = (id: string) => mutate(id, { visible: !getPanel(id).visible })
  const setSize     = (id: string, w: number, h: number) => mutate(id, { w, h })
  const fitSize     = (id: string) => mutate(id, { w: undefined, h: undefined })

  function swapOrder(a: string, b: string) {
    const oa = getPanel(a).order
    const ob = getPanel(b).order
    setData(prev => {
      const pg   = { ...(prev[pageId] ?? {}) }
      pg[a]      = { ...getPanel(a), order: ob }
      pg[b]      = { ...getPanel(b), order: oa }
      const next = { ...prev, [pageId]: pg }
      persist(next)
      return next
    })
  }

  function showAllPanels() {
    setData(prev => {
      const pg   = { ...(prev[pageId] ?? {}) }
      panelIds.forEach((id, i) => { pg[id] = { ...(pg[id] ?? { order: i }), visible: true } })
      const next = { ...prev, [pageId]: pg }
      persist(next)
      return next
    })
  }

  const sorted = [...panelIds].sort((a, b) => getPanel(a).order - getPanel(b).order)
  const hiddenCount = panelIds.filter(id => !getPanel(id).visible).length
  const showAll = sessionShow || holdShow

  return {
    unlocked,
    toggleUnlock:       () => setUnlocked(u => !u),
    sessionShow,
    toggleSessionShow:  () => setSessionShow(s => !s),
    holdShow,
    setHoldShow,
    showAll,
    dragFrom,
    setDragFrom,
    sorted,
    getPanel,
    isVisible:          (id: string) => showAll || getPanel(id).visible,
    togglePanel,
    setSize,
    fitSize,
    swapOrder,
    showAllPanels,
    hiddenCount,
  }
}

export type PageLayout = ReturnType<typeof usePageLayout>
