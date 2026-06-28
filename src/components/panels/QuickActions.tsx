import { useStore } from '../../store'
import { Plus } from 'lucide-react'

const ACTIONS: { label: string; type: string }[] = [
  { label: 'New Object',          type: ''                   },
  { label: 'New Document',        type: 'document'           },
  { label: 'New Decision Record', type: 'decision'           },
  { label: 'New Architecture Phase', type: 'architecture_phase' },
  { label: 'New Meeting',         type: 'meeting'            },
  { label: 'New Journal Entry',   type: 'journal'            },
  { label: 'New Knowledge Object',type: 'knowledge_object'   },
  { label: 'New Research',        type: 'research'           },
  { label: 'New AAR',             type: 'aar'                },
  { label: 'New Revision',        type: 'document'           },
]

export default function QuickActions() {
  const { openWizard } = useStore()

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Quick Actions</span>
        <Plus size={12} className="text-text-muted" />
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-surface-700">
        {ACTIONS.map(a => (
          <button
            key={a.label}
            onClick={() => openWizard(a.type || undefined)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-700 transition-colors group"
          >
            <span className="text-accent-blue text-[11px] font-bold leading-none group-hover:scale-110 transition-transform">+</span>
            <span className="text-text-secondary text-[11px] flex-1">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
