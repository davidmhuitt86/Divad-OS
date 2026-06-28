import { Flag, Target, CheckSquare, Zap, Map } from 'lucide-react'
import { useStore } from '../../store'

export default function MissionBrief() {
  const { appState } = useStore()
  const { currentAP, currentAPM, currentAPO, currentAPT, currentMIT, mission } = appState

  const hasData = currentAP || currentAPM || currentAPO || currentAPT || currentMIT

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Mission Brief</span>
        {hasData && <div className="status-dot animate-pulse-dot" />}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Mission */}
        <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Mission</div>
        <div className="text-text-primary text-[13px] font-medium leading-snug mb-2">
          {mission}
        </div>

        {hasData ? (
          <div className="grid grid-cols-2 gap-2">
            {currentAP && (
              <BriefItem icon={<Flag size={11} />} label="Active AP" value={currentAP.title} color="blue" />
            )}
            {currentAPM && (
              <BriefItem icon={<Map size={11} />} label="Active APM" value={currentAPM.title} color="cyan" />
            )}
            {currentAPO && (
              <BriefItem icon={<Target size={11} />} label="Active APO" value={currentAPO.title} color="green" />
            )}
            {currentAPT && (
              <BriefItem icon={<Zap size={11} />} label="Active APT" value={currentAPT.title} color="amber" />
            )}
            {currentMIT && (
              <BriefItem icon={<CheckSquare size={11} />} label="Today's MIT" value={currentMIT.title} color="purple" />
            )}
          </div>
        ) : (
          <div className="empty-state flex-1">
            <Flag size={20} />
            <span>No active phase set</span>
            <span className="text-[10px]">Ask the agent to create an Architecture Phase</span>
          </div>
        )}
      </div>
    </div>
  )
}

function BriefItem({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string
}) {
  const borderColor = color === 'blue' ? 'accent-blue' : color === 'green' ? 'accent-green' : color === 'amber' ? 'accent-amber' : color === 'cyan' ? 'accent-cyan' : 'accent-purple'
  const textColor   = color === 'blue' ? 'text-accent-blue' : color === 'green' ? 'text-accent-green' : color === 'amber' ? 'text-accent-amber' : color === 'cyan' ? 'text-accent-cyan' : 'text-accent-purple'
  return (
    <div className={`p-2 rounded border border-${borderColor}/20 bg-surface-700`}>
      <div className={`flex items-center gap-1 text-[10px] mb-1 ${textColor}`}>
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-text-primary text-[12px] font-medium leading-snug line-clamp-2">{value}</div>
    </div>
  )
}
