import { FileText } from 'lucide-react'
import DataTablePage, { type Column } from '../components/common/DataTablePage'

interface DraftRow { id: string; title: string; lastSaved: string; size: string }

const ROWS: DraftRow[] = [
  { id: '1', title: 'Incomplete Wiring Diagram',     lastSaved: '5/20/2025 7:15 AM', size: '12.4 KB' },
  { id: '2', title: 'Unfinished Compression Test',   lastSaved: '5/20/2025 6:02 AM', size: '8.1 KB' },
  { id: '3', title: 'Notes on PATS Issue',            lastSaved: '5/19/2025 9:33 PM', size: '5.6 KB' },
  { id: '4', title: 'Alternator Charging Issue',      lastSaved: '5/18/2025 5:41 PM', size: '9.2 KB' },
  { id: '5', title: 'New Alarm System Plan',          lastSaved: '5/18/2025 2:14 PM', size: '7.8 KB' },
]

const COLUMNS: Column<DraftRow>[] = [
  { key: 'title',     label: 'Title' },
  { key: 'lastSaved', label: 'Last Saved' },
  { key: 'size',      label: 'Size' },
]

export default function Drafts() {
  return <DataTablePage icon={FileText} title="Drafts" columns={COLUMNS} rows={ROWS} />
}
