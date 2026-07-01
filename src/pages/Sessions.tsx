import { History } from 'lucide-react'
import DataTablePage, { StatusPill, type Column } from '../components/common/DataTablePage'

interface SessionRow { id: string; sessionId: string; title: string; created: string; updated: string; status: string; objects: number }

const ROWS: SessionRow[] = [
  { id: '1', sessionId: 'WS-000123', title: '2002 Dodge Ram - No Start',       created: '5/20/2025 7:40 AM', updated: '5/20/2025 7:42 AM', status: 'Active',    objects: 28 },
  { id: '2', sessionId: 'WS-000122', title: '2015 Jaguar XF - Infotainment',   created: '5/19/2025 2:31 PM', updated: '5/19/2025 2:45 PM', status: 'Completed', objects: 42 },
  { id: '3', sessionId: 'WS-000121', title: 'TRX300 CDI Troubleshooting',      created: '5/18/2025 9:12 AM', updated: '5/18/2025 9:28 AM', status: 'Active',    objects: 19 },
  { id: '4', sessionId: 'WS-000120', title: 'Viper 5701 Remote Start',         created: '5/17/2025 11:03 AM', updated: '5/17/2025 11:10 AM', status: 'Draft',   objects: 15 },
  { id: '5', sessionId: 'WS-000119', title: 'Cooling System Diagram',          created: '5/16/2025 4:22 PM', updated: '5/16/2025 4:35 PM', status: 'Completed', objects: 33 },
]

const COLUMNS: Column<SessionRow>[] = [
  { key: 'sessionId', label: 'Session ID' },
  { key: 'title',     label: 'Title' },
  { key: 'created',   label: 'Created' },
  { key: 'updated',   label: 'Updated' },
  { key: 'status',    label: 'Status', render: r => <StatusPill value={r.status} /> },
  { key: 'objects',   label: 'Objects' },
]

export default function Sessions() {
  return <DataTablePage icon={History} title="Sessions" primaryActionLabel="New Session" columns={COLUMNS} rows={ROWS} />
}
