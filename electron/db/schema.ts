import initSqlJs, { type Database } from 'sql.js'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

let db: Database | null = null
let dbPath: string

export async function getDb(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs()
  const userDataPath = app.getPath('userData')
  dbPath = path.join(userDataPath, 'divad-os.db')

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  runMigrations(db)
  persist()
  return db
}

export function persist() {
  if (!db || !dbPath) return
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

function runMigrations(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS eke_objects (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      owner TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      priority TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      revision INTEGER NOT NULL DEFAULT 1,
      parent_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS revisions (
      id TEXT PRIMARY KEY,
      object_id TEXT NOT NULL,
      revision_number INTEGER NOT NULL,
      snapshot TEXT NOT NULL,
      change_summary TEXT,
      author TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      object_id TEXT,
      object_type TEXT,
      object_title TEXT,
      actor TEXT NOT NULL DEFAULT 'user',
      summary TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tool_calls TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_objects_type ON eke_objects(type);
    CREATE INDEX IF NOT EXISTS idx_objects_status ON eke_objects(status);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_revisions_object ON revisions(object_id);
  `)
}
