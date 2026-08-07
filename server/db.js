import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const file = process.env.DB_FILE
  ? resolve(process.env.DB_FILE)
  : resolve(process.cwd(), 'server/data/focusflow.db')

mkdirSync(dirname(file), { recursive: true })

export const db = new DatabaseSync(file)

// Сыртқы кілттер SQLite-та әдепкіде өшулі — қосып қоямыз, әйтпесе
// ON DELETE CASCADE жұмыс істемейді.
db.exec('PRAGMA foreign_keys = ON')
db.exec('PRAGMA journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    plan          TEXT    NOT NULL DEFAULT 'Free',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT    PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id   INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    title        TEXT    NOT NULL,
    done         INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS time_entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id    INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    started_at TEXT    NOT NULL DEFAULT (datetime('now')),
    ended_at   TEXT,
    seconds    INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user   ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_user      ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_projects_user   ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_entries_user    ON time_entries(user_id, started_at);

  -- Бір қолданушыда бір ғана жүріп тұрған таймер болуы керек. Бұл шартты
  -- қосымша кодта емес, деректер қорының өзінде бекітеміз.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_one_running
    ON time_entries(user_id) WHERE ended_at IS NULL;
`)

/** Мерзімі өткен сессияларды тазалау. */
export function purgeExpiredSessions() {
  db.prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now')`).run()
}

/**
 * Жаңа қолданушыға бос емес dashboard беру үшін бастапқы жоба мен
 * бірнеше тапсырма құрамыз.
 */
export function seedWorkspace(userId) {
  const project = db
    .prepare('INSERT INTO projects (user_id, name) VALUES (?, ?)')
    .run(userId, 'Бірінші жобам')

  const projectId = project.lastInsertRowid
  const insertTask = db.prepare(
    'INSERT INTO tasks (user_id, project_id, title) VALUES (?, ?, ?)',
  )

  for (const title of [
    'FocusFlow-мен танысу',
    'Бірінші тапсырманы қосу',
    'Таймерді іске қосып көру',
  ]) {
    insertTask.run(userId, projectId, title)
  }

  return projectId
}
