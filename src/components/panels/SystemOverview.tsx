import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { Box, FileText, GitBranch, CheckSquare, AlertTriangle, Link2 } from 'lucide-react'

export default function SystemOverview() {
  const { objects, navigateToObjects } = useStore()
  const [relCount, setRelCount] = useState<number | null>(null)

  useEffect(() => {
    const isElectron = typeof window !== 'undefined' && !!window.divadOS
    if (isElectron) window.divadOS.relationships.count().then(setRelCount)
  }, [objects.length])

  if (objects.length === 0) {
    return (
      <div className="panel flex flex-col">
        <div className="panel-header">
          <span className="panel-title">Engineering Health</span>
        </div>
        <div className="empty-state p-4 flex-1">
          <Box size={18} />
          <span>No objects yet</span>
        </div>
      </div>
    )
  }

  const docs      = objects.filter(o => o.type === 'document').length
  const tasks     = objects.filter(o => o.type === 'task').length
  const risks     = objects.filter(o => o.type === 'risk').length
  const decisions = objects.filter(o => o.type === 'decision').length
  const inReview  = objects.filter(o => o.status === 'in_review').length

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Engineering Health</span>
        <span className="text-[10px] text-accent-green">Live</span>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        <Stat icon={<Box size={14} />}           label="Total Objects"  value={objects.length} color="blue"   onClick={() => navigateToObjects()} />
        <Stat icon={<FileText size={14} />}      label="Documents"      value={docs}           color="cyan"   onClick={() => navigateToObjects('document')} />
        <Stat icon={<GitBranch size={14} />}     label="Decisions"      value={decisions}      color="purple" onClick={() => navigateToObjects('decision')} />
        <Stat icon={<CheckSquare size={14} />}   label="Tasks"          value={tasks}          color="green"  onClick={() => navigateToObjects('task')} />
        <Stat icon={<AlertTriangle size={14} />} label="Risks"          value={risks}          color="amber"  onClick={() => navigateToObjects('risk')} />
        <Stat icon={<Link2 size={14} />}         label="Relationships"  value={relCount ?? '…'} color="cyan" onClick={() => navigateToObjects()} />
      </div>
      <div className="px-3 pb-3">
        <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">In Review</div>
        <div className="h-1.5 rounded-full bg-surface-700 overflow-hidden cursor-pointer" onClick={() => navigateToObjects(undefined, 'in_review')}>
          <div className="h-full bg-accent-amber rounded-full transition-all"
            style={{ width: objects.length > 0 ? `${Math.round(inReview / objects.length * 100)}%` : '0%' }} />
        </div>
        <div className="text-[9px] text-text-muted mt-1">{inReview} of {objects.length} pending review</div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, color, onClick }: {
  icon: React.ReactNode; label: string; value: number | string; color: string; onClick?: () => void
}) {
  const colorMap: Record<string, string> = {
    blue:   'text-accent-blue',
    green:  'text-accent-green',
    amber:  'text-accent-amber',
    red:    'text-accent-red',
    purple: 'text-accent-purple',
    cyan:   'text-accent-cyan',
  }
  return (
    <div
      className="bg-surface-700 rounded p-2.5 flex flex-col gap-1 cursor-pointer hover:bg-surface-600 transition-colors"
      onClick={onClick}
    >
      <div className={`${colorMap[color]} flex items-center gap-1`}>{icon}</div>
      <div className="text-text-primary text-lg font-bold leading-none">{value}</div>
      <div className="text-text-muted text-[10px]">{label}</div>
    </div>
  )
}
