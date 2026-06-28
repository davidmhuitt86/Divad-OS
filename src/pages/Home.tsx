import { useEffect } from 'react'
import { useStore } from '../store'
import MissionBrief from '../components/panels/MissionBrief'
import ActivityFeed from '../components/panels/ActivityFeed'
import SystemOverview from '../components/panels/SystemOverview'
import OpenItems from '../components/panels/OpenItems'
import LayoutPanel from '../components/layout/LayoutPanel'
import LayoutLock from '../components/layout/LayoutLock'
import { usePageLayout } from '../hooks/usePageLayout'

const PANELS = ['missionBrief', 'activityFeed', 'systemOverview', 'openItems']

export default function Home() {
  const { loadAppState, loadActivity, loadObjects } = useStore()
  const layout = usePageLayout('home', PANELS)

  useEffect(() => {
    loadAppState(); loadActivity(); loadObjects()
    const isElectron = typeof window !== 'undefined' && !!window.divadOS
    if (isElectron) {
      const unsubActivity = window.divadOS.on('activity:new', () => loadActivity())
      const unsubState    = window.divadOS.on('state:refresh', () => { loadAppState(); loadObjects() })
      return () => { unsubActivity(); unsubState() }
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10, padding: 10, overflow: 'hidden', position: 'relative' }}>
      <div style={layout.unlocked
        ? { display: 'flex', flexWrap: 'wrap', gap: 10 }
        : { display: 'grid', gridTemplateColumns: '280px 1fr 210px 200px', gap: 10, height: '100%' }
      }>
        {layout.sorted.map(id => (
          <LayoutPanel key={id} id={id} layout={layout}
            lockedStyle={
              id === 'missionBrief'   ? { height: '100%' } :
              id === 'systemOverview' ? { height: '100%' } :
              id === 'openItems'      ? { height: '100%' } :
              { flex: 1, height: '100%' }
            }>
            {id === 'missionBrief'   && <MissionBrief />}
            {id === 'activityFeed'   && <ActivityFeed />}
            {id === 'systemOverview' && <SystemOverview />}
            {id === 'openItems'      && <OpenItems />}
          </LayoutPanel>
        ))}
      </div>
      <LayoutLock layout={layout} />
    </div>
  )
}
