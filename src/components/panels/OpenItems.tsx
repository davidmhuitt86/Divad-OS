import { useStore } from '../../store'
import { AlertTriangle, Shield, CheckSquare, GitBranch, ArrowRight } from 'lucide-react'

export default function OpenItems() {
  const { objects, navigateToObjects } = useStore()

  const decisions = objects.filter(o => o.type === 'decision' && o.status !== 'archived')
  const risks     = objects.filter(o => o.type === 'risk'     && o.status !== 'archived')
  const issues    = objects.filter(o => o.type === 'requirement' && o.status === 'in_review')
  const inProgress = objects.filter(o => o.type === 'task' && o.status === 'in_review')
  const overdue   = objects.filter(o => o.type === 'task' && o.status === 'draft' && o.priority === 'critical')

  const hasItems = decisions.length || risks.length || issues.length || inProgress.length

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Open Items</span>
      </div>
      {!hasItems ? (
        <div className="empty-state p-4">
          <CheckSquare size={18} />
          <span>No open items</span>
        </div>
      ) : (
        <div className="divide-y divide-surface-700">
          <Item icon={<GitBranch size={11} />} label="Open Decisions" count={decisions.length} color="purple" onClick={() => navigateToObjects('decision')} />
          <Item icon={<Shield size={11} />} label="Open Risks" count={risks.length} color="amber" onClick={() => navigateToObjects('risk')} />
          <Item icon={<AlertTriangle size={11} />} label="Open Issues" count={issues.length} color="red" onClick={() => navigateToObjects('requirement')} />
          <Item icon={<CheckSquare size={11} />} label="Tasks In Progress" count={inProgress.length} color="blue" onClick={() => navigateToObjects('task')} />
          {overdue.length > 0 && (
            <Item icon={<AlertTriangle size={11} />} label="Critical Tasks" count={overdue.length} color="red" onClick={() => navigateToObjects('task', 'draft')} />
          )}
        </div>
      )}
    </div>
  )
}

function Item({ icon, label, count, color, onClick }: { icon: React.ReactNode; label: string; count: number; color: string; onClick?: () => void }) {
  if (count === 0) return null
  const colorMap: Record<string, string> = {
    blue:   'text-accent-blue',
    amber:  'text-accent-amber',
    red:    'text-accent-red',
    purple: 'text-accent-purple',
  }
  return (
    <div onClick={onClick} className="flex items-center gap-2 px-3 py-2.5 hover:bg-surface-700 transition-colors cursor-pointer group">
      <span className={colorMap[color]}>{icon}</span>
      <span className="text-text-secondary text-[12px] flex-1">{label}</span>
      <span className={`text-sm font-semibold ${colorMap[color]}`}>{count}</span>
      <ArrowRight size={10} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
