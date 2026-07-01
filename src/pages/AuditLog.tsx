import { ClipboardCheck } from 'lucide-react'
import DataTablePage, { type Column } from '../components/common/DataTablePage'

interface AuditRow { id: string; timestamp: string; user: string; action: string; target: string }

const ROWS: AuditRow[] = [
  { id: '1', timestamp: '5/20/2025 7:42 AM', user: 'David', action: 'Analyzed workspace', target: 'WS-000121' },
  { id: '2', timestamp: '5/20/2025 7:40 AM', user: 'David', action: 'Opened session',     target: 'WS-000121' },
  { id: '3', timestamp: '5/19/2025 2:45 PM', user: 'David', action: 'Committed session',  target: 'WS-000122' },
  { id: '4', timestamp: '5/18/2025 9:28 AM', user: 'David', action: 'Reviewed candidate', target: 'CAN-000385' },
]

const COLUMNS: Column<AuditRow>[] = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'user',       label: 'User' },
  { key: 'action',     label: 'Action' },
  { key: 'target',     label: 'Target' },
]

export default function AuditLog() {
  return <DataTablePage icon={ClipboardCheck} title="Audit Log" columns={COLUMNS} rows={ROWS} />
}
