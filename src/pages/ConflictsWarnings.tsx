import { AlertTriangle } from 'lucide-react'
import DataTablePage, { StatusPill, type Column } from '../components/common/DataTablePage'

interface ConflictRow { id: string; type: string; description: string; severity: string; status: string }

const ROWS: ConflictRow[] = [
  { id: 'CNF-000234', type: 'Conflict', description: 'Battery voltage in 4 PSI engine code review',  severity: 'High',   status: 'Open' },
  { id: 'WRN-000123', type: 'Warning',  description: 'Unclassified sensor code observed',              severity: 'Medium', status: 'Open' },
  { id: 'WRN-000122', type: 'Warning',  description: 'Fuel pressure high but not start condition',      severity: 'Medium', status: 'Acknowledged' },
  { id: 'WRN-000121', type: 'Warning',  description: 'Aftermarket parts detected',                      severity: 'Low',    status: 'Acknowledged' },
  { id: 'WRN-000120', type: 'Warning',  description: 'Incomplete wiring diagram',                        severity: 'Low',    status: 'Resolved' },
]

const COLUMNS: Column<ConflictRow>[] = [
  { key: 'id',          label: 'ID' },
  { key: 'type',        label: 'Type' },
  { key: 'description',  label: 'Description' },
  { key: 'severity',    label: 'Severity', render: r => <StatusPill value={r.severity} /> },
  { key: 'status',      label: 'Status', render: r => <StatusPill value={r.status} /> },
]

export default function ConflictsWarnings() {
  return <DataTablePage icon={AlertTriangle} title="Conflicts / Warnings" columns={COLUMNS} rows={ROWS} />
}
