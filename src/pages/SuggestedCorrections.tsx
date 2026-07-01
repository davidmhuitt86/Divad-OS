import { Wand2 } from 'lucide-react'
import DataTablePage, { StatusPill, type Column } from '../components/common/DataTablePage'

interface CorrectionRow { id: string; observed: string; suggested: string; confidence: string; status: string }

const ROWS: CorrectionRow[] = [
  { id: '1', observed: 'Cam Sensor',      suggested: 'Camshaft Position Sensor',        confidence: '92%', status: 'Pending' },
  { id: '2', observed: 'PCM Relay',       suggested: 'Powertrain Control Module Relay', confidence: '81%', status: 'Pending' },
  { id: '3', observed: '4.7 Magnum V8',   suggested: '4.7L Magnum V8 Engine',           confidence: '96%', status: 'Acknowledged' },
]

const COLUMNS: Column<CorrectionRow>[] = [
  { key: 'observed',   label: 'Observed' },
  { key: 'suggested',  label: 'Suggested' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'status',     label: 'Status', render: r => <StatusPill value={r.status} /> },
]

export default function SuggestedCorrections() {
  return <DataTablePage icon={Wand2} title="Suggested Corrections" columns={COLUMNS} rows={ROWS} />
}
