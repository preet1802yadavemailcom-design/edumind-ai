const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { query, memStore } = require('../db/database')
const { generateToken, authMiddleware } = require('../middleware/auth')

const router = express.Router()
const USE_MEM = !process.env.DATABASE_URL

// ── REGISTER ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const hash = await bcrypt.hash(password, 12)

    if (USE_MEM) {
      // In-memory mode (no DB)
      if ([...memStore.users.values()].find(u => u.email === email)) {
        return res.status(409).json({ error: 'Email already registered' })
      }
      const user = { id: uuidv4(), name, email, password_hash: hash, xp: 150, streak: 0, league: 'Bronze', created_at: new Date() }
      memStore.users.set(user.id, user)
      return res.json({ token: generateToken(user), user: sanitize(user) })
    }

    // DB mode
    const exists = await query('SELECT id FROM users WHERE email=$1', [email])
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Email already registered' })

    const result = await query(
      'INSERT INTO users (name, email, password_hash, xp) VALUES ($1,$2,$3,150) RETURNING *',
      [name, email, hash]
    )
    const user = result.rows[0]
    res.json({ token: generateToken(user), user: sanitize(user) })
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ error: 'Registration failed. Try again.' })
  }
})

// ── LOGIN ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    let user
    if (USE_MEM) {
      user = [...memStore.users.values()].find(u => u.email === email)
    } else {
      const r = await query('SELECT * FROM users WHERE email=$1', [email])
      user = r.rows[0]
    }

    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    res.json({ token: generateToken(user), user: sanitize(user) })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ error: 'Login failed. Try again.' })
  }
})

// ── GET PROFILE ───────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let user
    if (USE_MEM) {
      user = memStore.users.get(req.user.id)
    } else {
      const r = await query('SELECT * FROM users WHERE id=$1', [req.user.id])
      user = r.rows[0]
    }
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: sanitize(user) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

// ── UPDATE ONBOARDING ─────────────────────────────────────────
router.patch('/onboarding', authMiddleware, async (req, res) => {
  try {
    const { field_of_study, learning_style, daily_goal, career_goal } = req.body
    if (USE_MEM) {
      const user = memStore.users.get(req.user.id)
      if (user) Object.assign(user, { field_of_study, learning_style, daily_goal, career_goal, xp: (user.xp || 0) + 150 })
      return res.json({ user: sanitize(user) })
    }
    const r = await query(
      'UPDATE users SET field_of_study=$1, learning_style=$2, daily_goal=$3, career_goal=$4, xp=xp+150 WHERE id=$5 RETURNING *',
      [field_of_study, learning_style, daily_goal, career_goal, req.user.id]
    )
    res.json({ user: sanitize(r.rows[0]) })
  } catch (err) {
    res.status(500).json({ error: 'Update failed' })
  }
})

// ── ADD XP ────────────────────────────────────────────────────
router.post('/xp', authMiddleware, async (req, res) => {
  try {
    const { amount, reason } = req.body
    if (!amount || amount < 0) return res.status(400).json({ error: 'Invalid XP amount' })
    
    if (USE_MEM) {
      const user = memStore.users.get(req.user.id)
      if (user) user.xp = (user.xp || 0) + amount
      return res.json({ xp: user?.xp || 0 })
    }
    const r = await query('UPDATE users SET xp=xp+$1 WHERE id=$2 RETURNING xp', [amount, req.user.id])
    res.json({ xp: r.rows[0].xp })
  } catch (err) {
    res.status(500).json({ error: 'XP update failed' })
  }
})

function sanitize(u) {
  if (!u) return null
  const { password_hash, ...safe } = u
  return safe
}

module.exports = router
