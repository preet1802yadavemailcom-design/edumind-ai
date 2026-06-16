# ⚡ EduMind AI — Quick Start (5 Minutes)

## Windows pe chalana

```
1. Node.js install karo → nodejs.org → LTS download
2. backend/.env.example ko copy karo → backend/.env banao
3. backend/.env mein GROQ_API_KEY aur JWT_SECRET daalo
4. scripts/start-windows.bat double-click karo
5. Browser: http://localhost:5173 ← DONE!
```

## Mac/Linux pe chalana

```bash
cd edumind-100
cp backend/.env.example backend/.env
# backend/.env mein GROQ_API_KEY aur JWT_SECRET daalo
bash scripts/start-mac-linux.sh
# Browser: http://localhost:5173 ← DONE!
```

## Minimum .env (sirf 3 lines zaroori hain)

```env
GROQ_API_KEY=gsk_your_key_from_console.groq.com
JWT_SECRET=run_this_to_generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
DATABASE_URL=postgresql://from_neon.tech
```

## Pre-deployment check

```bash
node scripts/deploy-check.js
```

## Deploy to production

```
Backend  → railway.app  → import GitHub repo → add .env vars → deploy
Frontend → vercel.com   → import GitHub repo → VITE_API_URL=railway_url → deploy
Domain   → Cloudflare   → add edu-mind.app → DNS records → connect to Vercel
```

## Health check (after deploy)

```
https://api.edu-mind.app/health
→ Shows all active APIs and their status
```

## Roadmap tab-by-tab:
- Phase 1: Local setup (20 min)
- Phase 2: Databases — Neon + Upstash (15 min)
- Phase 3: Add all 35 API keys (20 min)
- Phase 4: Push to GitHub (10 min)
- Phase 5: Deploy backend on Railway (20 min)
- Phase 6: Deploy frontend on Vercel (15 min)
- Phase 7: Connect edu-mind.app domain (20 min)
- Phase 8: Security + monitoring (15 min)
- Phase 9: Launch + first users (ongoing)

**Total: ~2 hours from zero to edu-mind.app live** 🚀
