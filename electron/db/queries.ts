import { randomUUID } from 'crypto'
import type { EKEObject, ActivityEvent, AgentMessage, Revision, Relationship } from '../../shared/types/index.js'
import { getDb, persist } from './schema.js'

function now() { return new Date().toISOString() }

type SqlParams = import('sql.js').SqlValue[]

async function all<T = Record<string, unknown>>(sql: string, params: SqlParams = []): Promise<T[]> {
  const db = await getDb()
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return rows
}

async function get<T = Record<string, unknown>>(sql: string, params: SqlParams = []): Promise<T | null> {
  const rows = await all<T>(sql, params)
  return rows[0] ?? null
}

async function run(sql: string, params: SqlParams = []): Promise<void> {
  const db = await getDb()
  db.run(sql, params)
  persist()
}

// ── DIS-0001 ID generation ────────────────────────────────────────────────────

async function nextPermanentId(): Promise<string> {
  const cur = await getConfig('global_object_seq')
  const next = (parseInt(cur ?? '0') + 1)
  await setConfig('global_object_seq', String(next))
  return `OBJ-${String(next).padStart(9, '0')}`
}

async function nextEngineeringId(category: string, subsystem: string, type: string, revision: number): Promise<string> {
  const prefix = `${category}-${subsystem}-${type}`
  const row = await get<{ next_seq: number }>('SELECT next_seq FROM dis_sequences WHERE eid_prefix = ?', [prefix])
  let seq: number
  if (!row) {
    seq = 1
    await run('INSERT INTO dis_sequences (eid_prefix, next_seq) VALUES (?, ?)', [prefix, 2])
  } else {
    seq = row.next_seq
    await run('UPDATE dis_sequences SET next_seq = ? WHERE eid_prefix = ?', [seq + 1, prefix])
  }
  return `${prefix}-${String(seq).padStart(6, '0')}-R${String(revision).padStart(2, '0')}`
}

function bumpEidRevision(eid: string, newRevision: number): string {
  // EID format: CAT-SUB-TYP-XXXXXX-RNN → bump revision suffix only
  const m = eid.match(/^(.+-\d{6})-R\d+$/)
  if (!m) return eid
  return `${m[1]}-R${String(newRevision).padStart(2, '0')}`
}

// ── Serialization ─────────────────────────────────────────────────────────────

function deserializeObject(row: Record<string, unknown>): EKEObject {
  return {
    ...(row as unknown as EKEObject),
    tags:    JSON.parse((row.tags    as string) || '[]'),
    metadata:JSON.parse((row.metadata as string) || '{}'),
    aliases: JSON.parse((row.aliases  as string) || '[]'),
  }
}

// ── Objects ──────────────────────────────────────────────────────────────────

export async function listObjects(type?: string, status?: string): Promise<EKEObject[]> {
  let sql = 'SELECT * FROM eke_objects WHERE 1=1'
  const params: SqlParams = []
  if (type)   { sql += ' AND type = ?';   params.push(type) }
  if (status) { sql += ' AND status = ?'; params.push(status) }
  sql += ' ORDER BY updated_at DESC'
  const rows = await all(sql, params)
  return rows.map(deserializeObject)
}

export async function getObject(id: string): Promise<EKEObject | null> {
  const row = await get('SELECT * FROM eke_objects WHERE id = ?', [id])
  return row ? deserializeObject(row) : null
}

export async function createObject(
  data: Omit<EKEObject, 'id' | 'created_at' | 'updated_at' | 'revision'>
): Promise<EKEObject> {
  const permanentId = await nextPermanentId()
  const revision = 1

  let engineering_id = data.engineering_id ?? null
  if (!engineering_id && data.dis_category && data.dis_subsystem && data.dis_type) {
    engineering_id = await nextEngineeringId(data.dis_category, data.dis_subsystem, data.dis_type, revision)
  }

  const obj: EKEObject = {
    ...data,
    id: permanentId,
    revision,
    engineering_id,
    aliases: data.aliases ?? [],
    created_at: now(),
    updated_at: now(),
  }

  await run(
    `INSERT INTO eke_objects
       (id,type,title,description,status,owner,tags,priority,metadata,revision,parent_id,created_at,updated_at,
        body,engineering_id,obj_class,dis_category,dis_subsystem,dis_type,short_name,aliases)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      obj.id, obj.type, obj.title, obj.description, obj.status, obj.owner,
      JSON.stringify(obj.tags), obj.priority, JSON.stringify(obj.metadata),
      obj.revision, obj.parent_id, obj.created_at, obj.updated_at,
      obj.body ?? null, obj.engineering_id, obj.obj_class ?? null,
      obj.dis_category ?? null, obj.dis_subsystem ?? null, obj.dis_type ?? null,
      obj.short_name ?? null, JSON.stringify(obj.aliases),
    ]
  )
  await saveRevision(obj, 'Created')
  await logActivity('object_created', obj, `Object created: ${obj.title}`)
  return obj
}

export async function updateObject(id: string, changes: Partial<EKEObject>): Promise<EKEObject | null> {
  const existing = await getObject(id)
  if (!existing) return null
  const newRevision = existing.revision + 1

  // Bump EID revision if one exists
  let engineering_id = changes.engineering_id ?? existing.engineering_id
  if (engineering_id) {
    engineering_id = bumpEidRevision(engineering_id, newRevision)
  } else if (
    (changes.dis_category ?? existing.dis_category) &&
    (changes.dis_subsystem ?? existing.dis_subsystem) &&
    (changes.dis_type ?? existing.dis_type)
  ) {
    // DIS fields now set for the first time on an existing object
    const cat = changes.dis_category ?? existing.dis_category!
    const sub = changes.dis_subsystem ?? existing.dis_subsystem!
    const typ = changes.dis_type ?? existing.dis_type!
    engineering_id = await nextEngineeringId(cat, sub, typ, newRevision)
  }

  const updated: EKEObject = {
    ...existing,
    ...changes,
    id,
    revision: newRevision,
    engineering_id,
    aliases: changes.aliases ?? existing.aliases ?? [],
    updated_at: now(),
  }

  await run(
    `UPDATE eke_objects SET
       title=?,description=?,status=?,owner=?,tags=?,priority=?,metadata=?,revision=?,updated_at=?,
       body=?,engineering_id=?,obj_class=?,dis_category=?,dis_subsystem=?,dis_type=?,short_name=?,aliases=?
     WHERE id=?`,
    [
      updated.title, updated.description, updated.status, updated.owner,
      JSON.stringify(updated.tags), updated.priority, JSON.stringify(updated.metadata),
      updated.revision, updated.updated_at,
      updated.body ?? null, updated.engineering_id, updated.obj_class ?? null,
      updated.dis_category ?? null, updated.dis_subsystem ?? null, updated.dis_type ?? null,
      updated.short_name ?? null, JSON.stringify(updated.aliases),
      id,
    ]
  )
  await saveRevision(updated, changes.body ? 'Body revised' : 'Updated')
  await logActivity('object_updated', updated, `Revision ${updated.revision} saved`)
  return updated
}

export async function approveObject(id: string, _note?: string): Promise<EKEObject | null> {
  return updateObject(id, { status: 'approved' })
}

// ── Revisions ─────────────────────────────────────────────────────────────────

async function saveRevision(obj: EKEObject, summary: string, author = 'user') {
  await run(
    `INSERT INTO revisions (id,object_id,revision_number,snapshot,change_summary,author,created_at)
     VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), obj.id, obj.revision, JSON.stringify(obj), summary, author, now()]
  )
}

// ── Relationships ─────────────────────────────────────────────────────────────

export async function createRelationship(sourceId: string, targetId: string, type: string): Promise<Relationship> {
  const rel: Relationship = { id: randomUUID(), source_id: sourceId, target_id: targetId, relationship_type: type, created_at: now() }
  await run(
    `INSERT OR IGNORE INTO relationships (id,source_id,target_id,relationship_type,created_at) VALUES (?,?,?,?,?)`,
    [rel.id, rel.source_id, rel.target_id, rel.relationship_type, rel.created_at]
  )
  return rel
}

export async function getAllRelationships(): Promise<Relationship[]> {
  return all<Relationship>('SELECT * FROM relationships')
}

export async function listRelationships(objectId: string): Promise<Relationship[]> {
  return all<Relationship>(
    'SELECT * FROM relationships WHERE source_id = ? OR target_id = ? ORDER BY created_at DESC',
    [objectId, objectId]
  )
}

export async function deleteRelationship(id: string): Promise<void> {
  await run('DELETE FROM relationships WHERE id = ?', [id])
}

export async function countAllRelationships(): Promise<number> {
  const rows = await all<{ n: number }>('SELECT COUNT(*) as n FROM relationships')
  return rows[0]?.n ?? 0
}

// ── Activity Log ──────────────────────────────────────────────────────────────

export async function logActivity(
  eventType: string,
  obj: EKEObject | null,
  summary: string,
  actor: 'user' | 'agent' = 'user',
  metadata: Record<string, unknown> = {}
): Promise<ActivityEvent> {
  const event: ActivityEvent = {
    id: randomUUID(), event_type: eventType,
    object_id: obj?.id ?? null, object_type: obj?.type ?? null, object_title: obj?.title ?? null,
    actor, summary, metadata, created_at: now(),
  }
  await run(
    `INSERT INTO activity_log (id,event_type,object_id,object_type,object_title,actor,summary,metadata,created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [event.id, event.event_type, event.object_id, event.object_type, event.object_title,
     event.actor, event.summary, JSON.stringify(event.metadata), event.created_at]
  )
  return event
}

export async function listActivity(limit = 50): Promise<ActivityEvent[]> {
  const rows = await all(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?`, [limit])
  return rows.map(r => ({ ...r, metadata: JSON.parse(r.metadata as string) }) as ActivityEvent)
}

// ── Agent Messages ────────────────────────────────────────────────────────────

export async function saveAgentMessage(msg: AgentMessage) {
  await run(
    `INSERT INTO agent_messages (id,role,content,tool_calls,created_at) VALUES (?,?,?,?,?)`,
    [msg.id, msg.role, msg.content, msg.tool_calls ? JSON.stringify(msg.tool_calls) : null, msg.created_at]
  )
}

export async function listAgentMessages(limit = 100): Promise<AgentMessage[]> {
  const rows = await all(`SELECT * FROM agent_messages ORDER BY created_at ASC LIMIT ?`, [limit])
  return rows.map(r => ({ ...r, tool_calls: r.tool_calls ? JSON.parse(r.tool_calls as string) : undefined }) as AgentMessage)
}

// ── App Config ────────────────────────────────────────────────────────────────

export async function getConfig(key: string): Promise<string | null> {
  const row = await get<{ value: string }>('SELECT value FROM app_config WHERE key = ?', [key])
  return row?.value ?? null
}

export async function setConfig(key: string, value: string) {
  await run('INSERT OR REPLACE INTO app_config (key,value) VALUES (?,?)', [key, value])
}

// ── Export Records ────────────────────────────────────────────────────────────

export interface ExportRecord {
  id: string
  object_id: string
  object_title: string
  format: string
  file_path: string | null
  signed_by: string | null
  signed_title: string | null
  signed_at: string | null
  exported_at: string
}

export async function createExportRecord(data: Omit<ExportRecord, 'id' | 'exported_at'>): Promise<ExportRecord> {
  const record: ExportRecord = { ...data, id: randomUUID(), exported_at: now() }
  await run(
    `INSERT INTO export_records (id,object_id,object_title,format,file_path,signed_by,signed_title,signed_at,exported_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [record.id, record.object_id, record.object_title, record.format,
     record.file_path, record.signed_by, record.signed_title, record.signed_at, record.exported_at]
  )
  persist()
  return record
}

export async function listExportRecords(objectId: string): Promise<ExportRecord[]> {
  return all<ExportRecord>(
    `SELECT * FROM export_records WHERE object_id=? ORDER BY exported_at DESC LIMIT 50`,
    [objectId]
  )
}

// ── App State ─────────────────────────────────────────────────────────────────

export async function getAppState() {
  const [apId, apmId, apoId, aptId, mitId, mission] = await Promise.all([
    getConfig('current_ap_id'), getConfig('current_apm_id'), getConfig('current_apo_id'),
    getConfig('current_apt_id'), getConfig('current_mit_id'), getConfig('mission'),
  ])
  const [currentAP, currentAPM, currentAPO, currentAPT, currentMIT] = await Promise.all([
    apId  ? getObject(apId)  : Promise.resolve(null),
    apmId ? getObject(apmId) : Promise.resolve(null),
    apoId ? getObject(apoId) : Promise.resolve(null),
    aptId ? getObject(aptId) : Promise.resolve(null),
    mitId ? getObject(mitId) : Promise.resolve(null),
  ])
  return { currentAP, currentAPM, currentAPO, currentAPT, currentMIT, mission: mission ?? 'Build the Engineering Knowledge Engine' }
}

// ── Graph Snapshot ────────────────────────────────────────────────────────────

export async function getGraphSnapshot() {
  const [nodes, edges] = await Promise.all([listObjects(), getAllRelationships()])
  return { nodes, edges }
}
