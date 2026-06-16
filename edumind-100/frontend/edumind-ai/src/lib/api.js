// ═══════════════════════════════════════════════════════════
//  EDUMIND AI — API Client (v3 — 100% Secure)
//  ALL keys on backend. Frontend only sends JWT token.
//  Multi-AI rotation happens server-side.
// ═══════════════════════════════════════════════════════════
import confetti from 'canvas-confetti'

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ── TOKEN ─────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('edumind_token')

function headers(extra = {}) {
  const t = getToken()
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}), ...extra }
}

async function api(path, opts = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...headers(), ...(opts.headers || {}) } })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return data
  } catch (err) {
    if (err.message.includes('fetch')) throw new Error('Cannot connect to server. Make sure backend is running.')
    throw err
  }
}

// ── AUTH ──────────────────────────────────────────────────
export async function apiRegister(name, email, password) {
  return api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
}
export async function apiLogin(email, password) {
  return api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}
export async function apiGetMe() {
  return api('/api/auth/me')
}
export async function apiUpdateOnboarding(profile) {
  return api('/api/auth/onboarding', { method: 'PATCH', body: JSON.stringify(profile) })
}
export async function apiAddXP(amount, reason = '') {
  return api('/api/auth/xp', { method: 'POST', body: JSON.stringify({ amount, reason }) })
}

// ── HEALTH CHECK ─────────────────────────────────────────
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok ? await res.json() : null
  } catch { return null }
}

// ── AI CALLS ─────────────────────────────────────────────
export async function callGrok(messages, system = '', json = false, persona = 'senior') {
  const data = await api('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, system, persona, json })
  })
  return data.result
}

export async function callGrokJSON(messages, system = '') {
  const data = await api('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, system, persona: 'senior', json: true })
  })
  try {
    const clean = data.result.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch { throw new Error('AI returned invalid JSON. Try again.') }
}

export async function generateQuizAPI(topic, difficulty = 'medium', count = 5) {
  return api('/api/ai/quiz', { method: 'POST', body: JSON.stringify({ topic, difficulty, count }) })
}

export async function generateScheduleAPI(exam, daysLeft, hoursPerDay, subjects = []) {
  const d = await api('/api/ai/schedule', { method: 'POST', body: JSON.stringify({ exam, daysLeft, hoursPerDay, subjects }) })
  return d.result
}

export async function generateFlashcardsAPI(topic, count = 10) {
  return api('/api/ai/flashcards', { method: 'POST', body: JSON.stringify({ topic, count }) })
}

export async function enhanceNotesAPI(notes, style = 'structured') {
  const d = await api('/api/ai/notes/enhance', { method: 'POST', body: JSON.stringify({ notes, style }) })
  return d.result
}

export async function researchAPI(query, depth = 'standard') {
  return api('/api/ai/research', { method: 'POST', body: JSON.stringify({ query, depth }) })
}

export async function analyzeResumeAPI(resume, jobDescription = '') {
  const d = await api('/api/ai/resume/analyze', { method: 'POST', body: JSON.stringify({ resume, jobDescription }) })
  return d.result
}

export async function interviewGenerateAPI(type = 'hr', domain = 'general', role = 'software engineer') {
  const d = await api('/api/ai/interview/generate', { method: 'POST', body: JSON.stringify({ type, domain, role }) })
  return d.result
}

export async function interviewEvaluateAPI(question, answer, type = 'hr') {
  const d = await api('/api/ai/interview/evaluate', { method: 'POST', body: JSON.stringify({ question, answer, type }) })
  return d.result
}

export async function startupIdeasAPI(domain, problem = '', targetMarket = 'India') {
  const d = await api('/api/ai/startup/ideas', { method: 'POST', body: JSON.stringify({ domain, problem, targetMarket }) })
  return d.result
}

export async function imageGenAPI(prompt) {
  const d = await api('/api/ai/image', { method: 'POST', body: JSON.stringify({ prompt }) })
  return d.url
}

export async function digitalTwinAPI(sessions, quizResults, topics, studyHours) {
  const d = await api('/api/ai/digital-twin', { method: 'POST', body: JSON.stringify({ sessions, quizResults, topics, studyHours }) })
  return d.result
}

export async function adaptiveRecapAPI(weakTopics, recentMistakes) {
  const d = await api('/api/ai/recap', { method: 'POST', body: JSON.stringify({ weakTopics, recentMistakes }) })
  return d.result
}

// ── CONFETTI ─────────────────────────────────────────────
export function fireConfetti() {
  confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#00d4ff', '#ffd700', '#7c3aed', '#00ff88'] })
}

// ── HELPERS ───────────────────────────────────────────────
export const PERSONAS = [
  { id: 'einstein', label: 'Einstein Mode',   emoji: '🧪', desc: 'Formal & precise' },
  { id: 'feynman',  label: 'Feynman Mode',    emoji: '🎯', desc: 'Simple analogies' },
  { id: 'kalam',    label: 'APJ Kalam Mode',  emoji: '🚀', desc: 'Inspirational' },
  { id: 'senior',   label: 'Friendly Senior', emoji: '😊', desc: 'Casual & warm' },
]
export const PERSONA_PROMPTS = {
  einstein: 'Be precise and scientific like Einstein.',
  feynman:  'Use simple analogies like Feynman.',
  kalam:    'Be inspirational like APJ Abdul Kalam.',
  senior:   'Be casual and friendly like a helpful senior student.',
}

export const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'History', 'Economics', 'English', 'Geography', 'Political Science']

export const PERF_DATA = [
  { month: 'Jan', actual: 62, predicted: 65 },
  { month: 'Feb', actual: 68, predicted: 70 },
  { month: 'Mar', actual: 71, predicted: 73 },
  { month: 'Apr', actual: 74, predicted: 76 },
  { month: 'May', actual: 79, predicted: 80 },
  { month: 'Jun', actual: 84, predicted: 85 },
]

export const MOCK_LB = [
  { rank: 1, name: 'Aryan S.', country: '🇮🇳', xp: 98400, streak: 142, badge: '👑' },
  { rank: 2, name: 'Priya M.', country: '🇮🇳', xp: 87200, streak: 98,  badge: '⚡' },
  { rank: 3, name: 'Alex K.',  country: '🇺🇸', xp: 76500, streak: 87,  badge: '🎯' },
  { rank: 4, name: 'Wei L.',   country: '🇨🇳', xp: 71200, streak: 76,  badge: '🔥' },
  { rank: 5, name: 'Sara T.',  country: '🇧🇷', xp: 68900, streak: 65,  badge: '🚀' },
]

export function fmtXP(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n/1000).toFixed(1) + 'K'
  return String(n)
}

export function getLeague(xp) {
  if (xp >= 50000) return { name: 'Diamond', color: '#00f5ff', emoji: '💎', rank: 6 }
  if (xp >= 20000) return { name: 'Platinum', color: '#e5e4e2', emoji: '🏆', rank: 5 }
  if (xp >= 10000) return { name: 'Gold',     color: '#FFD700', emoji: '🥇', rank: 4 }
  if (xp >= 5000)  return { name: 'Silver',   color: '#C0C0C0', emoji: '🥈', rank: 3 }
  if (xp >= 1000)  return { name: 'Bronze',   color: '#CD7F32', emoji: '🥉', rank: 2 }
  return { name: 'Newcomer', color: '#64748b', emoji: '⭐', rank: 1 }
}

export function getLevelXP(xp) {
  const level = Math.floor(xp / 500) + 1
  const current = xp % 500
  const progress = (current / 500) * 100
  return { level, current, needed: 500, progress }
}
