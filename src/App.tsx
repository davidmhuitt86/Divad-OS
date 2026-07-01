import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Home from './pages/Home'
import Operations from './pages/Operations'
import Architecture from './pages/Architecture'
import Repository from './pages/Repository'
import Knowledge from './pages/Knowledge'
import Objects from './pages/Objects'
import Workspace from './pages/Workspace'
import EngineeringWorkspace from './pages/EngineeringWorkspace'
import Reports from './pages/Reports'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import Assistant from './pages/Assistant'
import Sessions from './pages/Sessions'
import Drafts from './pages/Drafts'
import CommitHistory from './pages/CommitHistory'
import UniversalObjects from './pages/UniversalObjects'
import KnowledgeCandidates from './pages/KnowledgeCandidates'
import Relationships from './pages/Relationships'
import Evidence from './pages/Evidence'
import Graph from './pages/Graph'
import Timeline from './pages/Timeline'
import Reasoning from './pages/Reasoning'
import ConflictsWarnings from './pages/ConflictsWarnings'
import SuggestedCorrections from './pages/SuggestedCorrections'
import Users from './pages/Users'
import SystemHealth from './pages/SystemHealth'
import AuditLog from './pages/AuditLog'
import CreationWizard from './components/wizard/CreationWizard'
import ObjectViewer from './components/objects/ObjectViewer'
import UserGuide, { hasAcceptedGuide } from './components/onboarding/UserGuide'
import SplashScreen, { type BootMode } from './components/splash/SplashScreen'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useStore } from './store'

function getBootMode(): BootMode {
  try {
    const s = localStorage.getItem('divad-os-settings')
    return (s ? JSON.parse(s).bootMode : null) ?? 'animation_prompt'
  } catch { return 'animation_prompt' }
}

function ActivePage({ page }: { page: string }) {
  switch (page) {
    case 'home':         return <Home />
    case 'operations':   return <Operations />
    case 'architecture': return <Architecture />
    case 'repository':   return <Repository />
    case 'knowledge':    return <Knowledge />
    case 'objects':      return <Objects />
    case 'workspace':    return <Workspace />
    case 'engineering-workspace': return <EngineeringWorkspace />
    case 'reports':      return <Reports />
    case 'calendar':     return <Calendar />
    case 'settings':     return <Settings />
    case 'assistant':    return <Assistant />

    // AP-002 Milestone 4 sidebar
    case 'sessions':              return <Sessions />
    case 'drafts':                return <Drafts />
    case 'commit-history':        return <CommitHistory />
    case 'universal-objects':     return <UniversalObjects />
    case 'knowledge-candidates':  return <KnowledgeCandidates />
    case 'relationships':         return <Relationships />
    case 'evidence':              return <Evidence />
    case 'knowledge-graph':       return <Graph />
    case 'timeline':              return <Timeline />
    case 'reasoning':             return <Reasoning />
    case 'conflicts-warnings':    return <ConflictsWarnings />
    case 'suggested-corrections': return <SuggestedCorrections />
    case 'users':                 return <Users />
    case 'system-health':         return <SystemHealth />
    case 'audit-log':             return <AuditLog />

    default:             return <EngineeringWorkspace />
  }
}

export default function App() {
  const { activePage } = useStore()
  const [bootMode]      = useState<BootMode>(getBootMode)
  const [splashDone,    setSplashDone]    = useState(bootMode === 'auto')
  const [guideAccepted, setGuideAccepted] = useState(() => hasAcceptedGuide())

  if (!splashDone) {
    return <SplashScreen mode={bootMode} onEnter={() => setSplashDone(true)} />
  }

  if (!guideAccepted) {
    return <UserGuide onAccepted={() => setGuideAccepted(true)} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', background: '#0d0f14', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* 32px native title bar spacer — draggable, no content */}
      <div style={{ height: 32, flexShrink: 0, background: '#0d0f14', WebkitAppRegion: 'drag' } as React.CSSProperties} />
      <Header />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'hidden', background: '#0d0f14' }}>
          <ErrorBoundary key={activePage} page={activePage}>
            <ActivePage page={activePage} />
          </ErrorBoundary>
        </main>
      </div>
      <CreationWizard />
      <ObjectViewer />
    </div>
  )
}
