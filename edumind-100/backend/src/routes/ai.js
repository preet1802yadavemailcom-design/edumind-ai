// ═══════════════════════════════════════════════════════════════════════
//  EDUMIND AI — ALL AI ROUTES (uses every API from rotator)
// ═══════════════════════════════════════════════════════════════════════
const express = require('express')
const rateLimit = require('express-rate-limit')
const { authMiddleware } = require('../middleware/auth')
const {
  callAI, webSearch, getNews, generateImage, ocrImage,
  analyzeImage, searchYoutube, updateLeaderboard, getLeaderboard,
  getWeather, sendEmail, speechToText, textToSpeech, getAPIStatus
} = require('../services/aiRotator')

const router = express.Router()

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 40,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Rate limit: 40 AI req/min. Wait a moment.' }
})

router.use(authMiddleware)
router.use(aiLimiter)

const PERSONA_SYSTEMS = {
  einstein: 'You are Einstein Mode — scientific depth, mathematical precision, formal academic tone. Reference physical laws and equations.',
  feynman:  'You are Feynman Mode — make complex things beautifully simple. Use everyday analogies, humor, real-world examples.',
  kalam:    'You are APJ Abdul Kalam Mode — inspirational, patriotic, connect everything to Indian students and their dreams. Quote Kalam when relevant.',
  senior:   'You are a friendly senior student — casual Hinglish tone, say "yaar", "bhai", "basically". Warm, approachable, relatable.',
}

// ── 1. CHAT (AGI Mentor) ─────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages, system, persona = 'senior' } = req.body
    if (!messages?.length) return res.status(400).json({ error: 'Messages required' })
    const personaSys = PERSONA_SYSTEMS[persona] || PERSONA_SYSTEMS.senior
    const fullSys = `${personaSys}\n\nYou are EduMind AI — the world's most advanced AI education platform. ${system || ''}`
    const { result, provider, cached } = await callAI(messages, fullSys)
    res.json({ result, provider, cached })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 2. QUIZ GENERATOR ────────────────────────────────────────────────
router.post('/quiz', async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 5 } = req.body
    if (!topic) return res.status(400).json({ error: 'Topic required' })
    const sys = 'You are a quiz master. Return ONLY valid JSON, no markdown, no explanation, no backticks.'
    const msgs = [{ role: 'user', content: `Generate ${count} MCQ questions about "${topic}" at ${difficulty} difficulty for Indian students.\nReturn ONLY JSON: {"questions":[{"id":1,"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A) ...","explanation":"...","topic":"..."}]}` }]
    const { result } = await callAI(msgs, sys, true)
    const clean = result.replace(/```json|```/g, '').trim()
    res.json(JSON.parse(clean))
  } catch (err) { res.status(500).json({ error: 'Quiz generation failed: ' + err.message }) }
})

// ── 3. EXPLAIN TOPIC ─────────────────────────────────────────────────
router.post('/explain', async (req, res) => {
  try {
    const { topic, level = 'intermediate', persona = 'feynman' } = req.body
    if (!topic) return res.status(400).json({ error: 'Topic required' })
    const levels = { beginner: 'Explain for absolute beginners. No jargon.', intermediate: 'Assume basic knowledge. Include depth.', advanced: 'Full technical depth, edge cases, nuance.', expert: 'Research/PhD level detail.' }
    const sys = `${PERSONA_SYSTEMS[persona] || PERSONA_SYSTEMS.feynman}\n${levels[level] || levels.intermediate}\nUse markdown with clear headings, examples, and real-world applications.`
    const { result, provider } = await callAI([{ role: 'user', content: `Explain thoroughly: "${topic}"` }], sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 4. INTERVIEW GENERATE ────────────────────────────────────────────
router.post('/interview/generate', async (req, res) => {
  try {
    const { type = 'hr', domain = 'general', role = 'Software Engineer' } = req.body
    const prompts = {
      hr: `Generate 5 realistic behavioral HR interview questions for ${role} position. Include STAR method guidance for each. Make them challenging and realistic.`,
      technical: `Generate 5 technical interview questions for ${domain} / ${role} role. Mix theory and practical. Include what interviewers look for.`,
      coding: `Generate a LeetCode-style coding problem for ${domain}. JSON: {"title":"...","difficulty":"medium","description":"...","examples":[{"input":"...","output":"...","explanation":"..."}],"constraints":["..."],"hints":["..."],"approach":"..."}`,
      system: `Generate a system design interview question for senior ${role}. Include what components to discuss, scalability considerations, and evaluation criteria.`,
    }
    const sys = 'You are a senior FAANG interviewer. Generate realistic, challenging interview content used at top tech companies.'
    const { result, provider } = await callAI([{ role: 'user', content: prompts[type] || prompts.hr }], sys, type === 'coding')
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 5. INTERVIEW EVALUATE ────────────────────────────────────────────
router.post('/interview/evaluate', async (req, res) => {
  try {
    const { question, answer, type = 'hr' } = req.body
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' })
    const sys = 'You are a strict but fair FAANG interviewer. Give detailed, honest, actionable feedback. Use markdown.'
    const msgs = [{ role: 'user', content: `Interview Type: ${type}\n\nQuestion: "${question}"\n\nCandidate Answer: "${answer}"\n\nEvaluate comprehensively:\n1. Score (X/10) — be honest\n2. What was good (specific)\n3. Critical gaps & improvements\n4. Ideal answer structure\n5. Follow-up questions they should prepare\n6. Would you hire? Why/why not?` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 6. RESUME ANALYZER ───────────────────────────────────────────────
router.post('/resume/analyze', async (req, res) => {
  try {
    const { resume, jobDescription = '' } = req.body
    if (!resume || resume.length < 50) return res.status(400).json({ error: 'Paste your full resume' })
    const sys = 'You are an expert ATS system, career coach, and HR professional. Give brutally honest, highly actionable resume feedback. Use markdown with tables.'
    const msgs = [{ role: 'user', content: `Analyze this resume${jobDescription ? ` for: "${jobDescription}"` : ''}:\n\n${resume.slice(0, 4000)}\n\nProvide:\n## ATS Score: X/100\n## Top 5 Strengths\n## Critical Gaps\n## Missing Keywords (table)\n## Rewrites for 3 weak bullet points\n## Summary rewrite\n## One-line verdict` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 7. STUDY SCHEDULE ────────────────────────────────────────────────
router.post('/schedule', async (req, res) => {
  try {
    const { exam, daysLeft, hoursPerDay = 3, subjects = [] } = req.body
    if (!exam || !daysLeft) return res.status(400).json({ error: 'Exam and days required' })
    const sys = 'You are an expert study strategist using spaced repetition, active recall, and Pomodoro technique. Create detailed, practical schedules. Use markdown tables.'
    const msgs = [{ role: 'user', content: `Create a DETAILED study schedule:\nExam: ${exam}\nDays left: ${daysLeft}\nHours/day: ${hoursPerDay}\nSubjects: ${subjects.join(', ') || 'all relevant'}\n\nInclude: Week-by-week plan, daily hour breakdown, revision strategy, mock test schedule, last 3 days strategy, day-before-exam tips.` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 8. FLASHCARDS ────────────────────────────────────────────────────
router.post('/flashcards', async (req, res) => {
  try {
    const { topic, count = 10 } = req.body
    if (!topic) return res.status(400).json({ error: 'Topic required' })
    const sys = 'You are a flashcard expert using cognitive science principles. Return ONLY valid JSON.'
    const msgs = [{ role: 'user', content: `Generate ${count} high-quality flashcards for "${topic}".\nReturn ONLY JSON: {"cards":[{"front":"clear question or term","back":"comprehensive answer","difficulty":"easy|medium|hard","hint":"optional memory hint"}]}` }]
    const { result } = await callAI(msgs, sys, true)
    res.json(JSON.parse(result.replace(/```json|```/g, '').trim()))
  } catch (err) { res.status(500).json({ error: 'Flashcard generation failed: ' + err.message }) }
})

// ── 9. NOTES ENHANCER ────────────────────────────────────────────────
router.post('/notes/enhance', async (req, res) => {
  try {
    const { notes, style = 'structured' } = req.body
    if (!notes) return res.status(400).json({ error: 'Notes required' })
    const styles = {
      structured: 'Reorganize into clear headings, subheadings, bullet points, and key takeaways box.',
      cornell:    'Format as Cornell notes: narrow cues column left, wide notes right, summary at bottom.',
      mindmap:    'Create a text-based mind map with central concept and branching ideas.',
      summary:    'Compress to key points only. Remove all fluff. Max 30% of original length.',
    }
    const sys = `You are an expert note-taker. ${styles[style] || styles.structured} Use markdown.`
    const { result, provider } = await callAI([{ role: 'user', content: `Enhance:\n\n${notes.slice(0, 4000)}` }], sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 10. RESEARCH AGENT (uses Tavily + Serper + Exa + News + AI) ──────
router.post('/research', async (req, res) => {
  try {
    const { query, depth = 'standard' } = req.body
    if (!query) return res.status(400).json({ error: 'Query required' })
    const [searchResults, news, videos] = await Promise.allSettled([
      webSearch(query, depth === 'deep' ? 8 : 5, depth === 'deep'),
      getNews(query, 3),
      searchYoutube(query, 3)
    ])
    const sr = searchResults.value || { results: [], answer: '' }
    const newsItems = news.value || []
    const vids = videos.value || []
    const context = sr.results.slice(0, 5).map((r, i) => `[${i+1}] ${r.title || ''}: ${r.snippet || r.content || ''}`).join('\n\n')
    const newsCtx = newsItems.map(n => `• ${n.title}: ${n.description || ''}`).join('\n')
    const sys = 'You are a world-class research AI. Synthesize information into clear, well-structured reports. Cite sources by number. Use markdown with sections.'
    const msgs = [{ role: 'user', content: `Research: "${query}"\n\nWeb sources:\n${context}\n\nLatest news:\n${newsCtx}\n\nWrite a comprehensive research report: Executive Summary, Key Findings, Detailed Analysis, Conclusions, and numbered References.` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider, sources: sr.results.slice(0, 5), news: newsItems, videos: vids, searchProvider: sr.provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 11. STARTUP IDEAS ────────────────────────────────────────────────
router.post('/startup/ideas', async (req, res) => {
  try {
    const { domain, problem = '', targetMarket = 'India' } = req.body
    if (!domain) return res.status(400).json({ error: 'Domain required' })
    const sys = 'You are a serial entrepreneur and VC investor. Generate realistic, market-viable startup ideas with deep analysis. Use markdown.'
    const msgs = [{ role: 'user', content: `Generate 5 innovative startup ideas:\nDomain: ${domain}\nProblem: ${problem || 'any pain point'}\nMarket: ${targetMarket}\n\nFor each: Name, One-liner, Problem, Solution, Business model, Unique advantage, Market size estimate, Competition, Risk.` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 12. IMAGE GENERATION (FAL → Replicate → Pollinations) ────────────
router.post('/image', async (req, res) => {
  try {
    const { prompt, width = 800, height = 600 } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt required' })
    const { url, provider } = await generateImage(prompt, width, height)
    res.json({ url, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 13. DIGITAL TWIN ─────────────────────────────────────────────────
router.post('/digital-twin', async (req, res) => {
  try {
    const { sessions = [], quizResults = [], topics = [], studyHours = 0 } = req.body
    const sys = 'You are a learning psychologist and AI analyst. Create detailed, personalized learning profiles. Use markdown with tables and charts.'
    const msgs = [{ role: 'user', content: `Analyze this student's learning DNA:\nStudy hours: ${studyHours}h total\nTopics studied: ${topics.join(', ')}\nQuiz history: ${JSON.stringify(quizResults.slice(0,10))}\nSession count: ${sessions.length}\n\nProvide:\n1. Learning personality type (with scientific basis)\n2. Strongest subjects (with confidence %)\n3. Weak areas (specific gaps)\n4. Optimal study windows\n5. Personalized strategy\n6. 30-day improvement roadmap\n7. Predicted exam scores per subject` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 14. ADAPTIVE RECAP ───────────────────────────────────────────────
router.post('/recap', async (req, res) => {
  try {
    const { weakTopics = [], recentMistakes = [] } = req.body
    const sys = 'You are an adaptive learning engine. Create targeted, high-impact revision content. Use markdown.'
    const msgs = [{ role: 'user', content: `Create targeted recap for:\nWeak topics: ${weakTopics.join(', ')}\nRecent mistakes: ${recentMistakes.join(', ')}\n\nProvide: Quick notes, key formulas, memory tricks (mnemonics), 5 practice questions with answers, and a 20-minute revision plan.` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 15. VOICE — STT (Deepgram → AssemblyAI) ─────────────────────────
router.post('/voice/stt', async (req, res) => {
  try {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', async () => {
      try {
        const audio = Buffer.concat(chunks)
        const lang = req.headers['x-language'] || 'hi-IN'
        const { text, provider } = await speechToText(audio, lang)
        res.json({ text, provider })
      } catch (err) { res.status(500).json({ error: err.message }) }
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 16. VOICE — TTS (ElevenLabs) ────────────────────────────────────
router.post('/voice/tts', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body
    if (!text) return res.status(400).json({ error: 'Text required' })
    const { audio, format } = await textToSpeech(text, 'Rachel', language)
    res.set('Content-Type', `audio/${format}`)
    res.send(audio)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 17. OCR — Scan Textbook Page ────────────────────────────────────
router.post('/ocr', async (req, res) => {
  try {
    const { imageUrl } = req.body
    if (!imageUrl) return res.status(400).json({ error: 'Image URL required' })
    const text = await ocrImage(imageUrl)
    // Auto-solve if it looks like a problem
    if (text.length > 20) {
      const { result, provider } = await callAI([{ role: 'user', content: `I scanned this from a textbook:\n\n"${text}"\n\nIf this contains questions or problems, solve them step by step. If it's theory, summarize key points.` }], 'You are an expert tutor. Analyze scanned textbook content and either solve problems or summarize theory. Use markdown.')
      return res.json({ text, explanation: result, provider })
    }
    res.json({ text, explanation: null })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 18. IMAGE ANALYSIS (Gemini Vision) ──────────────────────────────
router.post('/analyze-image', async (req, res) => {
  try {
    const { image, prompt = 'Analyze this educational content and explain it' } = req.body
    if (!image) return res.status(400).json({ error: 'Image base64 required' })
    const result = await analyzeImage(image, prompt)
    res.json({ result, provider: 'gemini-vision' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 19. YOUTUBE LEARNING VIDEOS ──────────────────────────────────────
router.get('/youtube/:topic', async (req, res) => {
  try {
    const videos = await searchYoutube(req.params.topic, 6)
    res.json({ videos })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 20. LEADERBOARD (Upstash Redis real-time) ────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const board = await getLeaderboard(50)
    res.json({ leaderboard: board })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/leaderboard/update', async (req, res) => {
  try {
    const { xp = 10 } = req.body
    const username = req.user.name || req.user.email
    await updateLeaderboard(req.user.id, username, xp)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 21. WEATHER (for study environment tips) ─────────────────────────
router.get('/weather/:city', async (req, res) => {
  try {
    const weather = await getWeather(req.params.city || 'Varanasi')
    res.json({ weather })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 22. API STATUS DASHBOARD ─────────────────────────────────────────
router.get('/status', (req, res) => {
  const status = getAPIStatus()
  const totalAPIs = Object.values(status).flatMap(cat => Object.values(cat))
  const active = totalAPIs.filter(Boolean).length
  res.json({ status, summary: { total: totalAPIs.length, active, inactive: totalAPIs.length - active, coverage: `${Math.round((active/totalAPIs.length)*100)}%` } })
})

// ── 23. PITCH DECK GENERATOR (Startup Lab) ───────────────────────────
router.post('/startup/pitch', async (req, res) => {
  try {
    const { idea, market, team = '1 founder', stage = 'idea' } = req.body
    const sys = 'You are a YC partner and pitch deck expert. Create compelling, investor-ready pitch content. Use markdown.'
    const msgs = [{ role: 'user', content: `Generate a complete pitch deck outline for:\nIdea: ${idea}\nMarket: ${market}\nTeam: ${team}\nStage: ${stage}\n\nInclude all 12 slides: Problem, Solution, Market Size, Product, Business Model, Traction, Competition, Team, Financials, Ask, Vision, Why Now. For each slide: title, key points, one powerful stat or quote.` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 24. MULTILINGUAL TRANSLATE ───────────────────────────────────────
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang = 'Hindi', context = 'educational' } = req.body
    if (!text) return res.status(400).json({ error: 'Text required' })
    const sys = `You are a professional translator specializing in ${context} content. Translate naturally and accurately.`
    const msgs = [{ role: 'user', content: `Translate to ${targetLang} (keep technical terms where appropriate):\n\n${text.slice(0, 3000)}` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 25. FORMULA SHEET GENERATOR ──────────────────────────────────────
router.post('/formula-sheet', async (req, res) => {
  try {
    const { subject, chapter, level = 'class 12' } = req.body
    if (!subject) return res.status(400).json({ error: 'Subject required' })
    const sys = 'You are an expert educator. Create comprehensive, exam-focused formula sheets. Use markdown with LaTeX-style formulas.'
    const msgs = [{ role: 'user', content: `Create a complete formula sheet for:\nSubject: ${subject}\nChapter: ${chapter || 'all important chapters'}\nLevel: ${level}\n\nInclude: All key formulas, when to use each, common mistakes, quick derivation hints, exam tips.` }]
    const { result, provider } = await callAI(msgs, sys)
    res.json({ result, provider })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
