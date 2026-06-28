import { useState } from 'react'
import { Upload, Plus, ChevronDown, Github, FolderGit2, GitCommit, GitBranch, GitPullRequest } from 'lucide-react'
import RepoStatCards  from '../components/repository/RepoStatCards'
import RepoList, { type GroupKey } from '../components/repository/RepoList'
import FileExplorer   from '../components/repository/FileExplorer'
import RepoRightPanel from '../components/repository/RepoRightPanel'
import RepoBottomRow  from '../components/repository/RepoBottomRow'
import GitHubPanel    from '../components/repository/GitHubPanel'
import LayoutPanel from '../components/layout/LayoutPanel'
import LayoutLock  from '../components/layout/LayoutLock'
import { usePageLayout } from '../hooks/usePageLayout'
import { useStore }   from '../store'
import type { EKEObject } from '../../shared/types'

const PANELS = ['statCards', 'repoList', 'fileExplorer', 'rightPanel', 'bottomRow']

const SUB_TABS = [
  { id: 'explorer',    label: 'Explorer',    icon: <FolderGit2 size={11} /> },
  { id: 'commits',     label: 'Commits',     icon: <GitCommit size={11} /> },
  { id: 'branches',    label: 'Branches',    icon: <GitBranch size={11} /> },
  { id: 'pullrequests',label: 'Pull Requests',icon: <GitPullRequest size={11} /> },
]

export default function Repository() {
  const [groupKey,     setGroupKey]     = useState<GroupKey>('all')
  const [selectedObj,  setSelectedObj]  = useState<EKEObject | null>(null)
  const [activeTab,    setActiveTab]    = useState<'browse' | 'github'>('browse')
  const [browseTab,    setBrowseTab]    = useState('explorer')
  const { openWizard, setActivePage } = useStore()
  const layout = usePageLayout('repository', PANELS)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 14, gap: 10, position: 'relative' }}>
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
          {/* Sub-tabs for browse mode */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
            {SUB_TABS.map(t => (
              <button key={t.id} onClick={() => setBrowseTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'none', border: 'none', borderBottom: `2px solid ${browseTab === t.id ? '#3b82f6' : 'transparent'}`, cursor: 'pointer', fontSize: 11, color: browseTab === t.id ? '#3b82f6' : '#475569', fontWeight: browseTab === t.id ? 600 : 400, marginBottom: -1 }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <LayoutPanel id="statCards" layout={layout}>
            <RepoStatCards />
          </LayoutPanel>

          <div style={layout.unlocked ? { display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minHeight: 0 } : { display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
            <LayoutPanel id="repoList" layout={layout} lockedStyle={{ flexShrink: 0 }}>
              <RepoList selected={groupKey} onSelect={k => { setGroupKey(k); setSelectedObj(null) }} />
            </LayoutPanel>
            <LayoutPanel id="fileExplorer" layout={layout} lockedStyle={{ flex: 1, minWidth: 0 }}>
              {browseTab === 'explorer'     && <FileExplorer groupKey={groupKey} selectedId={selectedObj?.id ?? null} onSelect={setSelectedObj} />}
              {browseTab === 'commits'      && <CommitsPlaceholder />}
              {browseTab === 'branches'     && <BranchesPlaceholder />}
              {browseTab === 'pullrequests' && <PRsPlaceholder />}
            </LayoutPanel>
            <LayoutPanel id="rightPanel" layout={layout} lockedStyle={{ flexShrink: 0 }}>
              <RepoRightPanel obj={selectedObj} />
            </LayoutPanel>
          </div>

          <LayoutPanel id="bottomRow" layout={layout}>
            <RepoBottomRow />
          </LayoutPanel>
        </>
      )}

      <LayoutLock layout={layout} />
    </div>
  )
}

function CommitsPlaceholder() {
  const { setActivePage } = useStore()
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Commits</span>
        <button onClick={() => setActivePage('settings')} style={{ fontSize: 10, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Connect GitHub →</button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <GitCommit size={28} style={{ color: '#2a3042' }} />
        <div style={{ fontSize: 11, color: '#2a3042' }}>No commits yet — connect GitHub to see history</div>
      </div>
    </div>
  )
}

function BranchesPlaceholder() {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Branches</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <GitBranch size={28} style={{ color: '#2a3042' }} />
        <div style={{ fontSize: 11, color: '#2a3042' }}>Connect GitHub to view branches</div>
      </div>
    </div>
  )
}

function PRsPlaceholder() {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pull Requests</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <GitPullRequest size={28} style={{ color: '#2a3042' }} />
        <div style={{ fontSize: 11, color: '#2a3042' }}>Connect GitHub to view pull requests</div>
      </div>
    </div>
  )
}
