// ═══════════════════════════════════════════════════════════
//  EDUMIND AI — Global State Store (Zustand)
//  Auth is NOW wired to real backend JWT
// ═══════════════════════════════════════════════════════════
import {create} from 'zustand'
import {persist} from 'zustand/middleware'

// ── AUTH STORE (connected to backend) ─────────────────────
export const useAuth = create(persist((set,get)=>({
  user: null,
  token: null,
  isAuth: false,
  onboarded: false,

  // Called after register/login from api.js
  setSession: (user, token) => {
    localStorage.setItem('edumind_token', token)
    set({ user, token, isAuth: true, onboarded: !!user?.field_of_study })
  },
  // Called after onboarding complete
  finishOnboarding: (userData) => set({ onboarded: true, user: userData }),
  updateUser: (data) => set(s => ({ user: { ...s.user, ...data } })),
  logout: () => {
    localStorage.removeItem('edumind_token')
    set({ user: null, token: null, isAuth: false, onboarded: false })
  },
  getToken: () => localStorage.getItem('edumind_token') || get().token,
}),{ name: 'em-auth-v3', partialize: (s) => ({ user: s.user, token: s.token, isAuth: s.isAuth, onboarded: s.onboarded }) }))

// ── GAME / XP STORE ────────────────────────────────────────
export const useGame = create(persist((set,get)=>({
  xp: 0,
  level: 1,
  streak: 0,
  lastDay: '',
  badges: [],
  coins: 0,

  // Sync from server data
  syncFromServer: (userData) => {
    if (!userData) return
    const xp = userData.xp || 0
    set({
      xp,
      level: Math.floor(xp / 500) + 1,
      streak: userData.streak || 0,
    })
  },

  addXP: (amt, src='') => {
    const s = get()
    const today = new Date().toDateString()
    const yday = new Date(Date.now() - 86400000).toDateString()
    const newStreak = s.lastDay === today ? s.streak : s.lastDay === yday ? s.streak + 1 : 1
    const newXP = s.xp + amt
    const newLevel = Math.floor(newXP / 500) + 1
    const levelUp = newLevel > s.level
    set({ xp: newXP, level: newLevel, streak: newStreak, lastDay: today, coins: s.coins + Math.floor(amt/10) })

    // Sync to backend in background
    const token = localStorage.getItem('edumind_token')
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    if (token) {
      fetch(`${apiBase}/api/auth/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, reason: src })
      }).catch(() => {}) // silent fail — local state is source of truth
    }
    return { amt, levelUp, newLevel, newXP }
  },

  addBadge: (b) => set(s => ({ badges: s.badges.includes(b) ? s.badges : [...s.badges, b] })),
}),{ name: 'em-game-v3' }))

// ── LEARNING STORE ─────────────────────────────────────────
export const useLearn = create(persist((set)=>({
  style: 'visual',
  attention: 87,
  cogLoad: 42,
  wellness: 74,
  weakTopics: [],
  strongTopics: [],
  studyHours: 0,
  quantumSync: 94.2,
  bioWindowNow: true,
  quizHistory: [],
  sessionHistory: [],
  notes: [],
  flashcardSets: [],

  setAttention: (v) => set({ attention: v }),
  setCogLoad: (v) => set({ cogLoad: v }),
  addWeak: (t) => set(s => ({ weakTopics: [...new Set([...s.weakTopics, t])] })),
  removeWeak: (t) => set(s => ({ weakTopics: s.weakTopics.filter(x => x !== t) })),
  addQuizResult: (r) => set(s => ({ quizHistory: [r, ...s.quizHistory.slice(0, 49)] })),
  addSession: (s) => set(st => ({ sessionHistory: [s, ...st.sessionHistory.slice(0, 29)], studyHours: st.studyHours + (s.duration || 0) / 60 })),
  saveNote: (note) => set(s => ({ notes: [{ ...note, id: Date.now(), createdAt: new Date().toISOString() }, ...s.notes.slice(0, 99)] })),
  saveFlashcards: (set_) => set(s => ({ flashcardSets: [{ ...set_, id: Date.now(), createdAt: new Date().toISOString() }, ...s.flashcardSets.slice(0, 49)] })),
}),{ name: 'em-learn-v3' }))

// ── UI STORE ───────────────────────────────────────────────
export const useUI = create((set)=>({
  collapsed: false,
  lang: 'English',
  persona: 'senior',
  notifs: [],
  theme: 'dark',
  setLang: (l) => set({ lang: l }),
  setPersona: (p) => set({ persona: p }),
  toggleCollapse: () => set(s => ({ collapsed: !s.collapsed })),
  markAllRead: () => set(s => ({ notifs: s.notifs.map(n => ({ ...n, read: true })) })),
  pushNotif: (n) => set(s => ({ notifs: [{ id: Date.now(), ...n, time: 'Just now', read: false }, ...s.notifs.slice(0, 19)] })),
}))

// ── CHAT STORE ─────────────────────────────────────────────
export const useChat = create((set,get)=>({
  histories: {},
  getH: (id) => get().histories[id] || [],
  addMsg: (id, role, content) => set(s => ({ histories: { ...s.histories, [id]: [...(s.histories[id] || []), { role, content, ts: Date.now() }] } })),
  clearChat: (id) => set(s => { const h = { ...s.histories }; delete h[id]; return { histories: h } }),
}))
