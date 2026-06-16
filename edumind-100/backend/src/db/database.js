// ═══════════════════════════════════════════════════════════════
//  DATABASE SERVICE — PostgreSQL via Neon (FREE)
//  neon.tech → Create project → copy DATABASE_URL to .env
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg')

let pool = null

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Neon
      max: 10,
      idleTimeoutMillis: 30000
    })
    pool.on('error', (err) => console.error('DB Pool error:', err.message))
  }
  return pool
}

async function query(sql, params = []) {
  const db = getPool()
  if (!db) {
    console.warn('No DATABASE_URL — using in-memory mode')
    return { rows: [], rowCount: 0 }
  }
  const client = await db.connect()
  try {
    return await client.query(sql, params)
  } finally {
    client.release()
  }
}

// ── INITIALIZE TABLES ─────────────────────────────────────────
async function initDB() {
  const db = getPool()
  if (!db) return console.log('⚠️  No DATABASE_URL — skipping DB init (in-memory mode)')

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        field_of_study VARCHAR(255),
        learning_style VARCHAR(100),
        daily_goal VARCHAR(100),
        career_goal VARCHAR(255),
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        last_study_date DATE,
        league VARCHAR(50) DEFAULT 'Bronze',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS quiz_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        topic VARCHAR(255),
        difficulty VARCHAR(50),
        score INTEGER,
        total INTEGER,
        xp_earned INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS study_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        module VARCHAR(255),
        duration_minutes INTEGER DEFAULT 0,
        xp_earned INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500),
        content TEXT,
        enhanced_content TEXT,
        tags TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS flashcard_sets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        topic VARCHAR(255),
        cards JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS research_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        query TEXT,
        result TEXT,
        sources JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log('✅ Database initialized')
  } catch (err) {
    console.error('DB init error:', err.message)
  }
}

// In-memory fallback store (when no DB)
const memStore = { users: new Map(), sessions: [] }

module.exports = { query, initDB, memStore }
