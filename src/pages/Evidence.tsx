import { ClipboardList } from 'lucide-react'
import DataTablePage, { StatusPill, type Column } from '../components/common/DataTablePage'

interface EvidenceRow { id: string; evidenceId: string; type: string; relatedTo: string; dateAdded: string; status: string }

const ROWS: EvidenceRow[] = [
  { id: '1', evidenceId: 'EVD-000341', type: 'Service Manual PDF',   relatedTo: 'WS-000121', dateAdded: '5/20/2025 7:41 AM', status: 'Verified' },
  { id: '2', evidenceId: 'EVD-000340', type: 'Compression Test Results', relatedTo: 'WS-000121', dateAdded: '5/20/2025 7:40 AM', status: 'Verified' },
  { id: '3', evidenceId: 'EVD-000339', type: 'Wiring Diagram Image', relatedTo: 'REL-000345', dateAdded: '5/19/2025 3:15 PM', status: 'Verified' },
  { id: '4', evidenceId: 'EVD-000338', type: 'OEM Part Catalog',     relatedTo: 'OBJ-000122', dateAdded: '5/18/2025 10:22 AM', status: 'Pending' },
]

const COLUMNS: Column<EvidenceRow>[] = [
  { key: 'evidenceId', label: 'Evidence ID' },
  { key: 'type',       label: 'Type' },
  { key: 'relatedTo',  label: 'Related To' },
  { key: 'dateAdded',  label: 'Date Added' },
  { key: 'status',     label: 'Status', render: r => <StatusPill value={r.status} /> },
]

export default function Evidence() {
  return <DataTablePage icon={ClipboardList} title="Evidence" columns={COLUMNS} rows={ROWS} />
}
