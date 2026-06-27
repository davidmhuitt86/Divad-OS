import { useStore } from '../../store'
import { Activity, Bot, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ActivityFeed() {
  const { activity } = useStore()

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">Recent Activity</span>
        {activity.length > 0 && (
          <span className="text-[10px] text-text-muted">{activity.length} events</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activity.length === 0 ? (
          <div className="empty-state h-full">
            <Activity size={18} />
            <span>No activity yet</span>
          </div>
        ) : (
          <div className="divide-y divide-surface-700">
            {activity.map(event => (
              <div key={event.id} className="px-3 py-2.5 hover:bg-surface-700 transition-colors fade-in">
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 shrink-0 ${event.actor === 'agent' ? 'text-accent-blue' : 'text-text-muted'}`}>
                    {event.actor === 'agent' ? <Bot size={11} /> : <User size={11} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary text-[12px] leading-snug truncate">{event.summary}</div>
                    {event.object_title && (
                      <div className="text-text-muted text-[11px] truncate">{event.object_title}</div>
                    )}
                  </div>
                  <div className="text-text-muted text-[10px] shrink-0 font-mono">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: false })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
