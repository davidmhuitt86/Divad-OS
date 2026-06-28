export type ObjectStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'revised' | 'archived'

export type ObjectType =
  | 'document'
  | 'task'
  | 'knowledge_object'
  | 'decision'
  | 'architecture_phase'
  | 'research'
  | 'meeting'
  | 'journal'
  | 'product'
  | 'requirement'
  | 'risk'
  | 'question'
  | 'standard'
  | 'apo'
  | 'apt'
  | 'apm'
  | 'aar'
  | 'mit'

// ─── DIS-0001: Divad Identification Standard ──────────────────────────────────

export type ObjectClass =
  | 'Physical' | 'Logical' | 'Knowledge' | 'Reference' | 'Configuration'
  | 'AI' | 'Workflow' | 'Relationship' | 'Evidence' | 'Observation'
  | 'Reasoning' | 'Validation'

export interface Attachment {
  name: string
  path: string
  size: number
  ext: string
}

// ─── Core Object Model ────────────────────────────────────────────────────────

export interface EKEObject {
  // Permanent identity (OBJ-XXXXXXXXX — never changes)
  id: string
  type: ObjectType
  title: string
  description: string | null
  status: ObjectStatus
  owner: string | null
  tags: string[]
  priority: 'low' | 'medium' | 'high' | 'critical' | null
  metadata: Record<string, unknown>
  revision: number
  parent_id: string | null
  created_at: string
  updated_at: string

  // Body — main markdown content; locked once approved
  body: string | null

  // DIS-0001 identity fields
  engineering_id: string | null    // e.g. AR-KI-IP-000034-R03
  obj_class: ObjectClass | null    // Physical, Logical, Knowledge, ...
  dis_category: string | null      // AR, BU, KN, SW, HR, LG, MK, FN
  dis_subsystem: string | null     // KI, OS, KC, ...
  dis_type: string | null          // IP, SP, DR, KO, ...
  short_name: string | null        // Human short name
  aliases: string[]                // Array of aliases
}

export interface Revision {
  id: string
  object_id: string
  revision_number: number
  snapshot: EKEObject
  change_summary: string | null
  author: string
  created_at: string
}

export interface Relationship {
  id: string
  source_id: string
  target_id: string
  relationship_type: string
  created_at: string
}

export interface ActivityEvent {
  id: string
  event_type: string
  object_id: string | null
  object_type: ObjectType | null
  object_title: string | null
  actor: 'user' | 'agent'
  summary: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  tool_calls?: AgentToolCall[]
}

export interface AgentToolCall {
  name: string
  arguments: Record<string, unknown>
  result?: unknown
}

export interface AppState {
  currentAP: EKEObject | null
  currentAPM: EKEObject | null
  currentAPO: EKEObject | null
  currentAPT: EKEObject | null
  currentMIT: EKEObject | null
  mission: string
}

export interface IpcChannels {
  'objects:list': { type?: ObjectType; status?: ObjectStatus }
  'objects:get': { id: string }
  'objects:create': Omit<EKEObject, 'id' | 'created_at' | 'updated_at' | 'revision'>
  'objects:update': { id: string } & Partial<EKEObject>
  'objects:approve': { id: string; note?: string }
  'activity:list': { limit?: number }
  'agent:send': { message: string; context?: Record<string, unknown> }
  'agent:history': Record<string, never>
  'app:state': Record<string, never>
  'graph:snapshot': Record<string, never>
}
