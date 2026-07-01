import { HelpCircle } from 'lucide-react'
import DataTablePage, { StatusPill, type Column } from '../../components/common/DataTablePage'

interface CandidateRow { id: string; candidateId: string; name: string; category: string; confidence: string; status: string }

const ROWS: CandidateRow[] = [
  { id: '1', candidateId: 'CAN-000387', name: 'Fuel Pressure Regulator (Aftermarket)', category: 'Component', confidence: '78%', status: 'New' },
  { id: '2', candidateId: 'CAN-000386', name: 'P0340 - Camshaft Position Sensor Circuit', category: 'Code',    confidence: '95%', status: 'New' },
  { id: '3', candidateId: 'CAN-000385', name: 'P0341 - Camshaft Position Sensor Perf.',  category: 'Code',    confidence: '95%', status: 'New' },
  { id: '4', candidateId: 'CAN-000384', name: 'TRX300 CDI Unit (Unknown Brand)',          category: 'Component', confidence: '62%', status: 'Pending' },
  { id: '5', candidateId: 'CAN-000363', name: 'Viper 5701 Remote Start Module',            category: 'Component', confidence: '89%', status: 'Pending' },
  { id: '6', candidateId: 'CAN-000340', name: 'Snider 3rd Weld',                            category: 'Tool',      confidence: '55%', status: 'Pending' },
]

const COLUMNS: Column<CandidateRow>[] = [
  { key: 'candidateId', label: 'Candidate ID' },
  { key: 'name',        label: 'Name' },
  { key: 'category',    label: 'Category' },
  { key: 'confidence',  label: 'Confidence' },
  { key: 'status',      label: 'Status', render: r => <StatusPill value={r.status} /> },
]

export default function KnowledgeCandidates() {
  return <DataTablePage icon={HelpCircle} title="Knowledge Candidates" primaryActionLabel="Review Queue" columns={COLUMNS} rows={ROWS} />
}
