import { Users as UsersIcon } from 'lucide-react'
import DataTablePage, { StatusPill, type Column } from '../components/common/DataTablePage'

interface UserRow { id: string; name: string; email: string; role: string; status: string; lastLogin: string }

const ROWS: UserRow[] = [
  { id: '1', name: 'David Huitt',  email: 'admin@divadtech.com',    role: 'Administrator', status: 'Active', lastLogin: '5/20/2025 7:42 AM' },
  { id: '2', name: 'Engineer',     email: 'engineer@divadtech.com', role: 'Engineer',       status: 'Active', lastLogin: '5/19/2025 6:15 AM' },
  { id: '3', name: 'Analyst',      email: 'analyst@divadtech.com',  role: 'Analyst',        status: 'Active', lastLogin: '5/18/2025 4:33 PM' },
  { id: '4', name: 'Viewer',       email: 'viewer@divadtech.com',   role: 'Viewer',         status: 'Active', lastLogin: '5/16/2025 2:11 PM' },
]

const COLUMNS: Column<UserRow>[] = [
  { key: 'name',      label: 'Name' },
  { key: 'email',     label: 'Email' },
  { key: 'role',      label: 'Role' },
  { key: 'status',    label: 'Status', render: r => <StatusPill value={r.status} /> },
  { key: 'lastLogin', label: 'Last Login' },
]

export default function Users() {
  return <DataTablePage icon={UsersIcon} title="Users" primaryActionLabel="Add User" columns={COLUMNS} rows={ROWS} />
}
