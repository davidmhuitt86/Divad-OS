import { Share2 } from 'lucide-react'
import DataTablePage, { StatusPill, type Column } from '../components/common/DataTablePage'

interface RelationshipRow { id: string; relationshipId: string; source: string; target: string; type: string; status: string }

const ROWS: RelationshipRow[] = [
  { id: '1', relationshipId: 'REL-000441', source: '2002 Dodge Ram 1500', target: '4.7L Magnum V8 Engine',   type: 'HAS_PART',        status: 'Verified' },
  { id: '2', relationshipId: 'REL-000440', source: '4.7L Magnum V8 Engine', target: 'PCM',                    type: 'HAS_PART',        status: 'Verified' },
  { id: '3', relationshipId: 'REL-000439', source: 'PCM',                  target: 'Compression Cylinder 4',   type: 'HAS_MEASUREMENT', status: 'Verified' },
  { id: '4', relationshipId: 'REL-000438', source: 'Camshaft Position Sensor', target: 'P0340 Code',           type: 'RELATED_TO',      status: 'Pending' },
]

const COLUMNS: Column<RelationshipRow>[] = [
  { key: 'relationshipId', label: 'Relationship ID' },
  { key: 'source',         label: 'Source' },
  { key: 'target',         label: 'Target' },
  { key: 'type',           label: 'Type' },
  { key: 'status',         label: 'Status', render: r => <StatusPill value={r.status} /> },
]

export default function Relationships() {
  return <DataTablePage icon={Share2} title="Relationships" columns={COLUMNS} rows={ROWS} />
}
