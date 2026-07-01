import { GitBranch } from 'lucide-react'
import DataTablePage, { type Column } from '../components/common/DataTablePage'

interface CommitRow { id: string; commitId: string; session: string; committedBy: string; date: string; objects: number; changes: string }

const ROWS: CommitRow[] = [
  { id: '1', commitId: 'CM-000256', session: 'WS-000121', committedBy: 'David', date: '5/20/2025 7:42 AM', objects: 28, changes: '+12 / -2' },
  { id: '2', commitId: 'CM-000255', session: 'WS-000122', committedBy: 'David', date: '5/19/2025 2:45 PM', objects: 42, changes: '+18 / -4' },
  { id: '3', commitId: 'CM-000254', session: 'WS-000121', committedBy: 'David', date: '5/19/2025 9:20 AM', objects: 33, changes: '+7 / -1' },
  { id: '4', commitId: 'CM-000253', session: 'WS-000119', committedBy: 'David', date: '5/16/2025 4:35 PM', objects: 26, changes: '+9 / -3' },
  { id: '5', commitId: 'CM-000252', session: 'WS-000118', committedBy: 'David', date: '5/15/2025 1:20 PM', objects: 33, changes: '+11 / -2' },
]

const COLUMNS: Column<CommitRow>[] = [
  { key: 'commitId',    label: 'Commit ID' },
  { key: 'session',     label: 'Session' },
  { key: 'committedBy', label: 'Committed By' },
  { key: 'date',        label: 'Date' },
  { key: 'objects',     label: 'Objects' },
  { key: 'changes',     label: 'Changes' },
]

export default function CommitHistory() {
  return <DataTablePage icon={GitBranch} title="Commit History" columns={COLUMNS} rows={ROWS} />
}
