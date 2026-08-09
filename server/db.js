import pg from 'pg'
import { DEFAULT_LANG, translate } from './lib/i18n.js'

const { Pool, types } = pg

/**
 * Postgres (Supabase, Neon немесе жергілікті) — байланыс жолы DATABASE_URL
 * айнымалысынан алынады. Құпиясөз кодта да, репозиторийде де сақталмайды.
 */
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL қойылмаған. .env файлын жаса (үлгісі — .env.example) ' +
      'немесе хостингтің панелінде айнымалыны қос.',
  )
}

const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString)

// «Бүгін», «осы апта» деген ұғым қай уақыт белдеуімен есептелетіні.
// Онсыз есеп серверде UTC бойынша, ал қолданушыда жергілікті уақытпен
// саналып, күндер жылжып кетеді.
export const APP_TZ = process.env.APP_TZ ?? 'Asia/Almaty'

// bigint (COUNT, SUM) әдепкіде жол болып келеді — JSON-да "90" болып
// шықпауы үшін санға айналдырамыз.
types.setTypeParser(types.builtins.INT8, (value) => Number(value))

export const pool = new Pool({
  connectionString,
  // Supabase/Neon SSL талап етеді; жергілікті қорға ол қажет емес
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

// Байланысқа `SET TIME ZONE` жіберілмейді әрі оның қажеті жоқ: уақыт белдеуі
// есеп сұраныстарына параметр болып беріледі. Сессия күйіне сүйенсек,
// Supabase-тің transaction режиміндегі pooler-і оны сақтамай, «бүгін» деген
// ұғым кездейсоқ жылжып кетер еді.
pool.on('error', (error) => {
  console.error('Postgres пулында күтпеген қате:', error)
})

/** Қысқа көмекші: query(text, params) → { rows, rowCount }. */
export const query = (text, params) => pool.query(text, params)

/** Бір жол қайтарады немесе null. */
export async function one(text, params) {
  const { rows } = await pool.query(text, params)
  return rows[0] ?? null
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name          TEXT        NOT NULL,
    email         TEXT        NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- citext кез келген жерде қолжетімді емес, сондықтан регистрге тәуелсіз
  -- бірегейлікті индекспен қамтамасыз етеміз
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT        PRIMARY KEY,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id         INTEGER     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id   INTEGER     REFERENCES projects(id) ON DELETE SET NULL,
    title        TEXT        NOT NULL,
    done         BOOLEAN     NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS time_entries (
    id         INTEGER     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id    INTEGER     NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at   TIMESTAMPTZ,
    seconds    INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_user    ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_entries_user  ON time_entries(user_id, started_at);

  -- Бір қолданушыда бір ғана жүріп тұрған таймер болуы керек. Бұл шартты
  -- қосымша кодта емес, деректер қорының өзінде бекітеміз.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_one_running
    ON time_entries(user_id) WHERE ended_at IS NULL;
`

/** Схеманы құрады. Сервер тыңдамас бұрын шақырылуы керек. */
export async function migrate() {
  await pool.query(SCHEMA)
}

/** Мерзімі өткен сессияларды тазалау. */
export async function purgeExpiredSessions() {
  await pool.query('DELETE FROM sessions WHERE expires_at <= now()')
}

/**
 * Жаңа қолданушыға бос емес dashboard беру үшін бастапқы жоба мен
 * бірнеше тапсырма құрамыз. Мәтіні — тіркелген кездегі тілде; бұл дерек
 * қолданушыға тиесілі, сондықтан кейін тіл ауысса да өзгермейді.
 */
export async function seedWorkspace(userId, lang = DEFAULT_LANG) {
  const t = (key) => translate(lang, key)

  const project = await one(
    'INSERT INTO projects (user_id, name) VALUES ($1, $2) RETURNING id',
    [userId, t('seed.project')],
  )

  await pool.query(
    `INSERT INTO tasks (user_id, project_id, title)
     SELECT $1, $2, title FROM unnest($3::text[]) AS title`,
    [
      userId,
      project.id,
      [t('seed.task1'), t('seed.task2'), t('seed.task3')],
    ],
  )

  return project.id
}

export async function closePool() {
  await pool.end()
}
