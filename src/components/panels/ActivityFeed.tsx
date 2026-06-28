import { useStore } from '../../store'
import { Activity, Bot, User, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ActivityFeed() {
  const { activity, objects, openObject, setActivePage } = useStore()

  function handleItemClick(event: { object_id?: string; object_type?: string }) {
    if (event.object_id) {
      const obj = objects.find(o => o.id === event.object_id)
      if (obj) { openObject(obj); return }
    }
    // Fall back to operations activity view
    setActivePage('operations')
  }

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">Recent Activity</span>
        {activity.length > 0 && (
          <button
            onClick={() => setActivePage('operations')}
            className="text-[10px] text-accent-blue hover:underline bg-transparent border-none cursor-pointer"
          >
            View All →
          </button>
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
              <div
                key={event.id}
                className="px-3 py-2.5 hover:bg-surface-700 transition-colors fade-in cursor-pointer group"
                onClick={() => handleItemClick(event as any)}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 shrink-0 ${(event as any).actor === 'agent' ? 'text-accent-blue' : 'text-text-muted'}`}>
                    {(event as any).actor === 'agent' ? <Bot size={11} /> : <User size={11} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary text-[12px] leading-snug truncate">{event.summary}</div>
                    {(event as any).object_title && (
                      <div className="text-text-muted text-[11px] truncate">{(event as any).object_title}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-text-muted text-[10px] shrink-0 font-mono">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: false })}
                    </div>
                    <ArrowRight size={9} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
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
