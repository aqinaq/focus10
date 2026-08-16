import pg from 'pg'
import { DEFAULT_LANG, translate } from './lib/i18n.js'

const { Pool, types } = pg

/**
 * Postgres (Supabase, Neon немесе жергілікті) — байланыс жолы DATABASE_URL
 * айнымалысынан алынады. Құпиясөз кодта да, репозиторийде де сақталмайды.
 *
 * Vercel-дегі Supabase/Neon интеграциясы айнымалыны өз атымен қосады
 * (POSTGRES_URL, DATABASE_URL_UNPOOLED, …), сондықтан оларды да қабылдаймыз:
 * әйтпесе қор қосылып тұрғанымен, қосымша оны «жоқ» деп санайды.
 */
export const DB_URL_NAMES = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL_UNPOOLED',
  'SUPABASE_DB_URL',
]

/** Қай айнымалыдан алынғаны — диагностика үшін керек. */
export const dbUrlSource = DB_URL_NAMES.find((name) => Boolean(process.env[name])) ?? null

const connectionString = dbUrlSource ? process.env[dbUrlSource] : undefined

export const CONFIG_ERROR =
  'DATABASE_URL қойылмаған. .env файлын жаса (үлгісі — .env.example) ' +
  'немесе хостингтің панелінде айнымалыны қос.'

/** Дерекқор бапталған ба. Бапталмаса, қосымша сол туралы ашық айтады. */
export const dbConfigured = () => Boolean(connectionString)

const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString ?? '')

// «Бүгін», «осы апта» деген ұғым қай уақыт белдеуімен есептелетіні.
// Онсыз есеп серверде UTC бойынша, ал қолданушыда жергілікті уақытпен
// саналып, күндер жылжып кетеді.
export const APP_TZ = process.env.APP_TZ ?? 'Asia/Almaty'

// bigint (COUNT, SUM) әдепкіде жол болып келеді — JSON-да "90" болып
// шықпауы үшін санға айналдырамыз.
types.setTypeParser(types.builtins.INT8, (value) => Number(value))

// DATE-ті pg әдепкіде Date нысанына айналдырады да, JSON-да толық ISO уақыт
// болып шығады — сонда «2026-08-15» деген күн белдеуге қарай бір күнге
// жылжып кетуі мүмкін. Күнді қалай сақталса, солай — жол күйінде аламыз.
types.setTypeParser(types.builtins.DATE, (value) => value)

/**
 * Айнымалы қойылмаса, бұрын осы модуль импорт кезінде-ақ құлайтын. Тұрақты
 * серверде оны логтан көруге болатын, ал serverless-те бүкіл функция іске
 * қосылмай, хостинг мазмұнсыз «FUNCTION_INVOCATION_FAILED» бетін қайтаратын:
 * қолданушы да, әзірлеуші де себебін білмей қалатын. Сондықтан құламаймыз —
 * қосымша көтеріледі де, себебін өзі айтады (`server/app.js`).
 */
const unconfigured = () => Promise.reject(new Error(CONFIG_ERROR))

export const pool = connectionString
  ? new Pool({
      connectionString,
      // Supabase/Neon SSL талап етеді; жергілікті қорға ол қажет емес
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : { query: unconfigured, connect: unconfigured, end: async () => {}, on: () => {} }

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
    id                INTEGER     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name              TEXT        NOT NULL,
    email             TEXT        NOT NULL,
    password_hash     TEXT        NOT NULL,
    email_verified_at TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Бұрын құрылған қорларда бағана болмауы мүмкін
  ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

  -- citext кез келген жерде қолжетімді емес, сондықтан регистрге тәуелсіз
  -- бірегейлікті индекспен қамтамасыз етеміз
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT        PRIMARY KEY,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
  );

  -- Құпиясөзді қалпына келтіру мен email растау сілтемелері. Токеннің өзі
  -- емес, оның sha256 хеші сақталады: қорға қол жеткізген адам сілтемені
  -- қалпына келтіре алмауы керек. Бір токен — бір рет (қолданылса, өшеді).
  CREATE TABLE IF NOT EXISTS auth_tokens (
    token_hash TEXT        PRIMARY KEY,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_auth_tokens_user ON auth_tokens(user_id, kind);

  CREATE TABLE IF NOT EXISTS projects (
    id         INTEGER     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id               INTEGER     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id          INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id       INTEGER     REFERENCES projects(id) ON DELETE SET NULL,
    title            TEXT        NOT NULL,
    done             BOOLEAN     NOT NULL DEFAULT false,
    -- Жоспарлауға керек үш өріс: қанша уақыт алады, қаншалық маңызды,
    -- қашанға дейін бітуі керек. Үшеуі де міндетті емес — бос қалса,
    -- жоспарлағыш әдепкі мәнмен жұмыс істей береді.
    estimate_minutes INTEGER,
    priority         SMALLINT    NOT NULL DEFAULT 2,
    due_date         DATE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at     TIMESTAMPTZ
  );

  -- Бұрын құрылған қорларда бұл бағаналар болмауы мүмкін
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimate_minutes INTEGER;
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority SMALLINT NOT NULL DEFAULT 2;
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;

  -- Күндік жоспар: «бүгін қанша уақытым бар» деген жауап пен содан шыққан
  -- тізім. Бір күнге бір жоспар — қайта жоспарласа, ескісі ауысады.
  CREATE TABLE IF NOT EXISTS day_plans (
    id               INTEGER     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id          INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day              DATE        NOT NULL,
    capacity_minutes INTEGER     NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_day_plans_user_day ON day_plans(user_id, day);

  CREATE TABLE IF NOT EXISTS plan_items (
    id       INTEGER  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    plan_id  INTEGER  NOT NULL REFERENCES day_plans(id) ON DELETE CASCADE,
    task_id  INTEGER  NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    minutes  INTEGER  NOT NULL,
    position INTEGER  NOT NULL,
    reason   TEXT     NOT NULL DEFAULT 'pace'
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_items_unique ON plan_items(plan_id, task_id);

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

/** Мерзімі өткен қалпына келтіру/растау токендерін тазалау. */
export async function purgeExpiredTokens() {
  await pool.query('DELETE FROM auth_tokens WHERE expires_at <= now()')
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
