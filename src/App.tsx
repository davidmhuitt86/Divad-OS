import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Home from './pages/Home'
import Operations from './pages/Operations'
import Architecture from './pages/Architecture'
import Repository from './pages/Repository'
import Knowledge from './pages/Knowledge'
import Objects from './pages/Objects'
import Placeholder from './pages/Placeholder'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useStore } from './store'

function ActivePage({ page }: { page: string }) {
  switch (page) {
    case 'home':         return <Home />
    case 'operations':   return <Operations />
    case 'architecture': return <Architecture />
    case 'repository':   return <Repository />
    case 'knowledge':    return <Knowledge />
    case 'objects':      return <Objects />
    case 'workspace':    return <Placeholder title="Workspace" />
    case 'reports':      return <Placeholder title="Reports" />
    case 'calendar':     return <Placeholder title="Calendar" />
    case 'settings':     return <Placeholder title="Settings" />
    default:             return <Operations />
  }
}

export default function App() {
  const { activePage } = useStore()

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', background: '#0d0f14', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, overflow: 'hidden', background: '#0d0f14' }}>
          <ErrorBoundary key={activePage} page={activePage}>
            <ActivePage page={activePage} />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
