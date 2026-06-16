require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { initDB } = require('./db/database')
const { getAPIStatus } = require('./services/aiRotator')
const authRoutes = require('./routes/auth')
const aiRoutes = require('./routes/ai')

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: [
    'http://localhost:5173', 'http://localhost:3000',
    'https://edu-mind.app', 'https://www.edu-mind.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { error: 'Too many requests' } }))

app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)

// Full health + status dashboard
app.get('/health', (req, res) => {
  const apiStatus = getAPIStatus()
  const allAPIs = Object.entries(apiStatus).flatMap(([cat, apis]) =>
    Object.entries(apis).map(([name, active]) => ({ category: cat, name, active }))
  )
  const activeCount = allAPIs.filter(a => a.active).length
  res.json({
    status: 'ok',
    service: 'EduMind AI Backend — World No.1',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    apis: { active: activeCount, total: allAPIs.length, coverage: `${Math.round((activeCount/allAPIs.length)*100)}%`, breakdown: apiStatus },
    uptime: Math.round(process.uptime()) + 's',
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  })
})

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }))
app.use((err, req, res, next) => { console.error(err.message); res.status(500).json({ error: 'Server error' }) })

async function start() {
  await initDB()
  app.listen(PORT, () => {
    const status = getAPIStatus()
    const aiActive = Object.values(status.ai_chat).filter(Boolean).length
    const totalActive = Object.values(status).flatMap(Object.values).filter(Boolean).length
    console.log(`
╔══════════════════════════════════════════════════════╗
║   🧠 EduMind AI Backend — World No.1  🚀             ║
║   Port: ${PORT}  |  Health: http://localhost:${PORT}/health   ║
╚══════════════════════════════════════════════════════╝`)
    console.log(`\n✅ AI Chat providers active: ${aiActive}/7`)
    Object.entries(status.ai_chat).forEach(([k,v]) => console.log(`   ${v?'✅':'❌'} ${k}`))
    console.log(`\n✅ Voice providers: ${Object.values(status.voice).filter(Boolean).length}/4`)
    console.log(`✅ Search providers: ${Object.values(status.search).filter(Boolean).length}/6`)
    console.log(`✅ Image providers: ${Object.values(status.images).filter(Boolean).length}/5`)
    console.log(`✅ Database services: ${Object.values(status.database).filter(Boolean).length}/4`)
    console.log(`\n📊 Total APIs active: ${totalActive}/${Object.values(status).flatMap(Object.values).length}`)
    if (!process.env.DATABASE_URL) console.log('\n⚠️  No DATABASE_URL — running in-memory mode (add for persistence)')
  })
}

start().catch(console.error)
