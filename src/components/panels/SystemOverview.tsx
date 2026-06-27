import { useStore } from '../../store'
import { Box, FileText, GitBranch, CheckSquare, AlertTriangle, Shield } from 'lucide-react'

export default function SystemOverview() {
  const { objects } = useStore()

  if (objects.length === 0) {
    return (
      <div className="panel flex flex-col">
        <div className="panel-header">
          <span className="panel-title">System Overview</span>
        </div>
        <div className="empty-state p-4 flex-1">
          <Box size={18} />
          <span>No objects yet</span>
        </div>
      </div>
    )
  }

  const docs     = objects.filter(o => o.type === 'document').length
  const tasks    = objects.filter(o => o.type === 'task').length
  const risks    = objects.filter(o => o.type === 'risk').length
  const decisions = objects.filter(o => o.type === 'decision').length
  const inProgress = objects.filter(o => o.status === 'in_review').length
  const approved  = objects.filter(o => o.status === 'approved').length

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="panel-title">System Overview</span>
        <span className="text-[10px] text-accent-green">Live</span>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        <Stat icon={<Box size={14} />} label="Total Objects" value={objects.length} color="blue" />
        <Stat icon={<FileText size={14} />} label="Documents" value={docs} color="cyan" />
        <Stat icon={<GitBranch size={14} />} label="Decisions" value={decisions} color="purple" />
        <Stat icon={<CheckSquare size={14} />} label="Tasks" value={tasks} color="green" />
        <Stat icon={<AlertTriangle size={14} />} label="Risks" value={risks} color="amber" />
        <Stat icon={<Shield size={14} />} label="In Review" value={inProgress} color="blue" />
      </div>
    </div>
  )
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue:   'text-accent-blue',
    green:  'text-accent-green',
    amber:  'text-accent-amber',
    red:    'text-accent-red',
    purple: 'text-accent-purple',
    cyan:   'text-accent-cyan',
  }
  return (
    <div className="bg-surface-700 rounded p-2.5 flex flex-col gap-1">
      <div className={`${colorMap[color]} flex items-center gap-1`}>{icon}</div>
      <div className="text-text-primary text-lg font-bold leading-none">{value}</div>
      <div className="text-text-muted text-[10px]">{label}</div>
    </div>
  )
}
