import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'
import { useStore } from './store'

const PAGES: Record<string, React.ReactNode> = {
  home:         <Home />,
  operations:   <Placeholder title="Operations" />,
  architecture: <Placeholder title="Architecture" />,
  engineering:  <Placeholder title="Engineering" />,
  repository:   <Placeholder title="Repository" />,
  search:       <Placeholder title="Search" />,
  agent:        <Placeholder title="AI Assistant (full workspace)" />,
  calendar:     <Placeholder title="Calendar" />,
  reports:      <Placeholder title="Reports" />,
  settings:     <Placeholder title="Settings" />,
}

export default function App() {
  const { activePage } = useStore()

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', background: '#0d0f14', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, overflow: 'hidden', background: '#0d0f14' }}>
          {PAGES[activePage] ?? <Home />}
        </main>
      </div>
    </div>
  )
}
