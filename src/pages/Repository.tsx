import { useState } from 'react'
import { Upload, Download, Plus, ChevronDown, Github } from 'lucide-react'
import RepoStatCards  from '../components/repository/RepoStatCards'
import RepoList       from '../components/repository/RepoList'
import FileExplorer   from '../components/repository/FileExplorer'
import RepoRightPanel from '../components/repository/RepoRightPanel'
import RepoBottomRow  from '../components/repository/RepoBottomRow'
import GitHubPanel    from '../components/repository/GitHubPanel'
import { useStore }   from '../store'

const REPO_NAMES: Record<string, string> = {
  '1': 'DIVAD-OS-CORE',
  '2': 'EKE-KNOWLEDGE-ENGINE',
  '3': 'DIVAD-OS-FRONTEND',
  '4': 'DIVAD-OS-MOBILE',
  '5': 'DOCUMENTATION',
  '6': 'ARCHITECTURE-MODELS',
  '7': 'INFRASTRUCTURE',
  '8': 'TEMPLATES',
}

export default function Repository() {
  const [selectedRepo, setSelectedRepo] = useState('1')
  const [activeTab, setActiveTab] = useState<'browse' | 'github'>('github')
  const { githubConfig, openWizard, setActivePage } = useStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 14, gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Repository</h1>
          <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Version. Track. Protect. Every engineering asset.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 7, padding: 3, gap: 2 }}>
            {(['github', 'browse'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '5px 14px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: activeTab === tab ? 600 : 400, background: activeTab === tab ? '#1a1e28' : 'transparent', color: activeTab === tab ? '#e2e8f0' : '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                {tab === 'github' && <Github size={11} />}
                {tab === 'github' ? 'GitHub Sync' : 'Browse'}
              </button>
            ))}
          </div>
          <button onClick={() => setActivePage('settings')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
            <Upload size={13} /> Import
          </button>
          <button onClick={() => openWizard('document')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
            <Plus size={13} /> New <ChevronDown size={11} />
          </button>
        </div>
      </div>

      {activeTab === 'github' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <GitHubPanel />
        </div>
      ) : (
        <>
          <RepoStatCards />
          <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
            <RepoList selected={selectedRepo} onSelect={setSelectedRepo} />
            <FileExplorer repoName={REPO_NAMES[selectedRepo] ?? 'REPOSITORY'} />
            <RepoRightPanel repoName={REPO_NAMES[selectedRepo]?.split('-').map(w => w[0] + w.slice(1).toLowerCase()).join('-') ?? 'Repository'} />
          </div>
          <RepoBottomRow />
        </>
      )}
    </div>
  )
}
