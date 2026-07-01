import { Box } from 'lucide-react'
import DataTablePage, { StatusPill, type Column } from '../../components/common/DataTablePage'

interface ObjectRow { id: string; objectId: string; name: string; type: string; category: string; status: string }

const ROWS: ObjectRow[] = [
  { id: '1', objectId: 'OBJ-00120', name: 'Powertrain Control Module (PCM)', type: 'Module',    category: 'Powertrain', status: 'Active' },
  { id: '2', objectId: 'OBJ-00122', name: 'Camshaft Position Sensor',        type: 'Component',  category: 'Sensor',     status: 'Active' },
  { id: '3', objectId: 'OBJ-00121', name: '4.7L Magnum V8 Engine',           type: 'Engine',      category: 'Powertrain', status: 'Active' },
  { id: '4', objectId: 'OBJ-00120', name: '2002 Dodge Ram 1500',             type: 'Vehicle',     category: 'Truck',      status: 'Active' },
  { id: '5', objectId: 'OBJ-00118', name: 'Fuel Pressure Regulator',         type: 'Component',   category: 'Fuel System', status: 'Active' },
  { id: '6', objectId: 'OBJ-00117', name: 'Starter Relay',                   type: 'Component',   category: 'Electrical', status: 'Active' },
]

const COLUMNS: Column<ObjectRow>[] = [
  { key: 'objectId', label: 'Object ID' },
  { key: 'name',     label: 'Name' },
  { key: 'type',     label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'status',   label: 'Status', render: r => <StatusPill value={r.status} /> },
]

export default function UniversalObjects() {
  return <DataTablePage icon={Box} title="Universal Objects" primaryActionLabel="Add Object" columns={COLUMNS} rows={ROWS} />
}
