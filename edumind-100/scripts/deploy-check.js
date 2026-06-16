// EduMind AI — Pre-deployment checker
// Run: node scripts/deploy-check.js

const fs = require('fs')
const path = require('path')

console.log('\n🧠 EduMind AI — Pre-deployment Check\n')
console.log('='.repeat(50))

let passed = 0, failed = 0, warnings = 0

function check(label, condition, type = 'required') {
  const icon = condition ? '✅' : type === 'required' ? '❌' : '⚠️ '
  console.log(`${icon} ${label}`)
  if (condition) passed++
  else if (type === 'required') failed++
  else warnings++
}

// Check .env exists
const envPath = path.join(__dirname, '../backend/.env')
const envExists = fs.existsSync(envPath)
check('.env file exists in backend/', envExists, 'required')

if (envExists) {
  const env = fs.readFileSync(envPath, 'utf8')
  const getVal = (key) => {
    const match = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
    return match ? match[1].trim() : null
  }

  console.log('\n--- REQUIRED APIs ---')
  check('GROQ_API_KEY set', !!getVal('GROQ_API_KEY'), 'required')
  check('JWT_SECRET set (min 20 chars)', (getVal('JWT_SECRET') || '').length >= 20, 'required')
  check('DATABASE_URL set', !!getVal('DATABASE_URL'), 'required')

  console.log('\n--- AI ROTATION (more = better) ---')
  const aiProviders = ['GROQ_API_KEY','GEMINI_API_KEY','SAMBANOVA_API_KEY','OPENROUTER_API_KEY','MISTRAL_API_KEY','CEREBRAS_API_KEY','NVIDIA_API_KEY']
  let activeAI = 0
  aiProviders.forEach(k => { const v = getVal(k); if(v && !v.includes('your_key')) activeAI++ })
  check(`AI providers active: ${activeAI}/7`, activeAI >= 2, activeAI >= 1 ? 'required' : 'required')
  
  console.log('\n--- CACHING ---')
  check('REDIS_URL set (saves 70% API costs)', !!getVal('REDIS_URL'), 'optional')
  check('UPSTASH_REDIS_REST_URL set', !!getVal('UPSTASH_REDIS_REST_URL'), 'optional')

  console.log('\n--- VOICE FEATURES ---')
  check('DEEPGRAM_API_KEY (voice input)', !!getVal('DEEPGRAM_API_KEY'), 'optional')
  check('ELEVENLABS_API_KEY (voice output)', !!getVal('ELEVENLABS_API_KEY'), 'optional')

  console.log('\n--- SEARCH FEATURES ---')
  check('TAVILY_API_KEY (web search)', !!getVal('TAVILY_API_KEY'), 'optional')
  check('SERPER_DEV_API_KEY (Google search)', !!getVal('SERPER_DEV_API_KEY'), 'optional')
  check('NEWS_API_KEY (news)', !!getVal('NEWS_API_KEY'), 'optional')

  console.log('\n--- IMAGE FEATURES ---')
  check('FAL_KEY (image generation)', !!getVal('FAL_KEY'), 'optional')
  check('CLOUDINARY_API_KEY (file uploads)', !!getVal('CLOUDINARY_API_KEY'), 'optional')
  check('OCR_SPACE_API_KEY (textbook scan)', !!getVal('OCR_SPACE_API_KEY'), 'optional')

  console.log('\n--- SECURITY CHECK ---')
  const jwtSecret = getVal('JWT_SECRET') || ''
  check('JWT_SECRET is not default placeholder', !jwtSecret.includes('GENERATE'), 'required')
  check('JWT_SECRET is long enough (32+ chars)', jwtSecret.length >= 32, 'required')
  
  // Check .env is in .gitignore
  const gitignorePath = path.join(__dirname, '../backend/.gitignore')
  if (fs.existsSync(gitignorePath)) {
    const gi = fs.readFileSync(gitignorePath, 'utf8')
    check('.env in .gitignore (CRITICAL!)', gi.includes('.env'), 'required')
  }
}

console.log('\n--- FRONTEND ---')
const frontendEnv = path.join(__dirname, '../frontend/edumind-ai/.env')
if (fs.existsSync(frontendEnv)) {
  const fe = fs.readFileSync(frontendEnv, 'utf8')
  const apiUrl = fe.match(/VITE_API_URL=(.+)/)?.[1] || ''
  check('VITE_API_URL set in frontend/.env', !!apiUrl, 'required')
  check('VITE_API_URL points to backend', apiUrl.includes('localhost') || apiUrl.includes('railway') || apiUrl.includes('render'), 'required')
  check('NO API keys in frontend .env (security!)', !fe.includes('GROQ') && !fe.includes('gsk_'), 'required')
} else {
  check('frontend/.env exists', false, 'required')
}

console.log('\n' + '='.repeat(50))
console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${warnings} warnings`)

if (failed === 0) {
  console.log('\n🚀 ALL CHECKS PASSED! Ready to deploy.')
  console.log('   Next: push to GitHub → Railway backend → Vercel frontend\n')
} else {
  console.log(`\n❌ Fix ${failed} required issue(s) before deploying!\n`)
  process.exit(1)
}
