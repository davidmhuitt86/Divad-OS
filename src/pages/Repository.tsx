import { useState } from 'react'
import { Upload, Download, Plus, ChevronDown } from 'lucide-react'
import RepoStatCards  from '../components/repository/RepoStatCards'
import RepoList       from '../components/repository/RepoList'
import FileExplorer   from '../components/repository/FileExplorer'
import RepoRightPanel from '../components/repository/RepoRightPanel'
import RepoBottomRow  from '../components/repository/RepoBottomRow'

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 14, gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Repository</h1>
          <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Version. Track. Protect. Every engineering asset.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
            <Upload size={13} /> Import
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
            <Download size={13} /> Export
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
            <Plus size={13} /> New <ChevronDown size={11} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <RepoStatCards />

      {/* Main 3-column */}
      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
        <RepoList selected={selectedRepo} onSelect={setSelectedRepo} />
        <FileExplorer repoName={REPO_NAMES[selectedRepo] ?? 'REPOSITORY'} />
        <RepoRightPanel repoName={REPO_NAMES[selectedRepo]?.split('-').map(w => w[0] + w.slice(1).toLowerCase()).join('-') ?? 'Repository'} />
      </div>

      {/* Bottom row */}
      <RepoBottomRow />
    </div>
  )
}
