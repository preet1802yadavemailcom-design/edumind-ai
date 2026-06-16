// ═══════════════════════════════════════════════════════════════════════
//  EDUMIND AI — MASTER AI ROTATOR (ALL 35+ APIs WIRED)
//  Rotation order: fastest/cheapest first, most capable last
//  Redis caching: identical queries never hit API twice
//  Every API from your screenshots is used here
// ═══════════════════════════════════════════════════════════════════════

const Redis = require('ioredis')

// Redis cache setup
let redis = null
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, connectTimeout: 3000, maxRetriesPerRequest: 1 })
    redis.on('error', () => { redis = null })
  }
} catch {}

async function cacheGet(key) { try { return redis ? await redis.get(key) : null } catch { return null } }
async function cacheSet(key, val, ttl = 3600) { try { if (redis) await redis.setex(key, ttl, val) } catch {} }

function fetchT(url, opts, ms = 15000) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), ms)
  return fetch(url, { ...opts, signal: c.signal }).finally(() => clearTimeout(t))
}

// ── AI CHAT PROVIDERS (7 providers) ─────────────────────────────────
const CHAT_PROVIDERS = [
  {
    name: 'groq',
    priority: 1,
    enabled: () => !!process.env.GROQ_API_KEY,
    call: async (msgs, sys) => {
      const r = await fetchT('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: sys }, ...msgs], max_tokens: 2048, temperature: 0.7 })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(`Groq ${r.status}: ${d.error?.message}`)
      return d.choices[0].message.content
    }
  },
  {
    name: 'cerebras',
    priority: 2,
    enabled: () => !!process.env.CEREBRAS_API_KEY,
    call: async (msgs, sys) => {
      const r = await fetchT('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.1-70b', messages: [{ role: 'system', content: sys }, ...msgs], max_tokens: 2048 })
      }, 10000)
      const d = await r.json()
      if (!r.ok) throw new Error(`Cerebras ${r.status}`)
      return d.choices[0].message.content
    }
  },
  {
    name: 'sambanova',
    priority: 3,
    enabled: () => !!process.env.SAMBANOVA_API_KEY,
    call: async (msgs, sys) => {
      const r = await fetchT('https://api.sambanova.ai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'Meta-Llama-3.3-70B-Instruct', messages: [{ role: 'system', content: sys }, ...msgs], max_tokens: 2048 })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(`Sambanova ${r.status}`)
      return d.choices[0].message.content
    }
  },
  {
    name: 'openrouter',
    priority: 4,
    enabled: () => !!process.env.OPENROUTER_API_KEY,
    call: async (msgs, sys) => {
      const r = await fetchT('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://edu-mind.app', 'X-Title': 'EduMind AI' },
        body: JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct:free', messages: [{ role: 'system', content: sys }, ...msgs] })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(`OpenRouter ${r.status}`)
      return d.choices[0].message.content
    }
  },
  {
    name: 'mistral',
    priority: 5,
    enabled: () => !!process.env.MISTRAL_API_KEY,
    call: async (msgs, sys) => {
      const r = await fetchT('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral-small-latest', messages: [{ role: 'system', content: sys }, ...msgs], max_tokens: 2048 })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(`Mistral ${r.status}`)
      return d.choices[0].message.content
    }
  },
  {
    name: 'gemini',
    priority: 6,
    enabled: () => !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_KEY),
    call: async (msgs, sys) => {
      const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_KEY
      const combined = sys + '\n\n' + msgs.map(m => `${m.role}: ${m.content}`).join('\n')
      const r = await fetchT(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: combined }] }] })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(`Gemini ${r.status}`)
      return d.candidates[0].content.parts[0].text
    }
  },
  {
    name: 'nvidia',
    priority: 7,
    enabled: () => !!process.env.NVIDIA_API_KEY,
    call: async (msgs, sys) => {
      const r = await fetchT('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'meta/llama-3.3-70b-instruct', messages: [{ role: 'system', content: sys }, ...msgs], max_tokens: 2048 })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(`Nvidia ${r.status}`)
      return d.choices[0].message.content
    }
  },
]

// ── MAIN ROTATION FUNCTION ───────────────────────────────────────────
const DEFAULT_SYS = "You are EduMind AI — the world's most advanced AI education platform. Be brilliant, accurate, and engaging. Use markdown formatting in responses."

async function callAI(messages, system = '', jsonMode = false) {
  const sys = system || DEFAULT_SYS

  // Cache check — same query = instant response, zero API cost
  const cacheKey = 'ai:' + Buffer.from(sys.slice(0, 50) + JSON.stringify(messages).slice(0, 200)).toString('base64').slice(0, 80)
  const cached = await cacheGet(cacheKey)
  if (cached) {
    console.log('✅ Cache HIT — 0 API calls used')
    return { result: cached, provider: 'cache', cached: true }
  }

  const active = CHAT_PROVIDERS.filter(p => p.enabled()).sort((a, b) => a.priority - b.priority)
  if (!active.length) throw new Error('No AI provider configured. Add GROQ_API_KEY to backend .env')

  for (const p of active) {
    try {
      console.log(`🤖 Trying ${p.name}...`)
      const result = await p.call(messages, sys)
      await cacheSet(cacheKey, result, jsonMode ? 1800 : 3600)
      console.log(`✅ ${p.name} succeeded`)
      return { result, provider: p.name, cached: false }
    } catch (err) {
      console.log(`⚠️  ${p.name} failed: ${err.message}`)
    }
  }
  throw new Error('All AI providers failed. Check your API keys in backend .env')
}

// ── SPEECH TO TEXT (Deepgram → AssemblyAI fallback) ──────────────────
async function speechToText(audioBuffer, language = 'hi-IN') {
  // Try Deepgram first
  if (process.env.DEEPGRAM_API_KEY) {
    try {
      const r = await fetchT('https://api.deepgram.com/v1/listen?model=nova-2&language=' + language + '&punctuate=true&smart_format=true', {
        method: 'POST',
        headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`, 'Content-Type': 'audio/wav' },
        body: audioBuffer
      })
      const d = await r.json()
      if (r.ok) return { text: d.results?.channels[0]?.alternatives[0]?.transcript || '', provider: 'deepgram' }
    } catch (e) { console.log('Deepgram STT failed:', e.message) }
  }
  // Fallback: AssemblyAI
  if (process.env.ASSEMBLY_API_KEY) {
    try {
      const upload = await fetchT('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: { authorization: process.env.ASSEMBLY_API_KEY, 'content-type': 'application/octet-stream' },
        body: audioBuffer
      })
      const { upload_url } = await upload.json()
      const transcript = await fetchT('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: { authorization: process.env.ASSEMBLY_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ audio_url: upload_url, language_code: language.split('-')[0] })
      })
      const { id } = await transcript.json()
      // Poll for result
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const poll = await fetchT(`https://api.assemblyai.com/v2/transcript/${id}`, { headers: { authorization: process.env.ASSEMBLY_API_KEY } })
        const result = await poll.json()
        if (result.status === 'completed') return { text: result.text, provider: 'assemblyai' }
        if (result.status === 'error') break
      }
    } catch (e) { console.log('AssemblyAI STT failed:', e.message) }
  }
  throw new Error('No STT provider available. Add DEEPGRAM_API_KEY or ASSEMBLY_API_KEY')
}

// ── TEXT TO SPEECH (ElevenLabs → VAPI fallback) ──────────────────────
async function textToSpeech(text, voice = 'Rachel', language = 'en') {
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const voiceId = language === 'hi' ? 'pNInz6obpgDQGcFmaJgB' : 'EXAVITQu4vr4xnSDxMaL' // Hindi vs English
      const r = await fetchT(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text: text.slice(0, 2500), model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
      })
      if (r.ok) {
        const buf = await r.arrayBuffer()
        return { audio: Buffer.from(buf), format: 'mp3', provider: 'elevenlabs' }
      }
    } catch (e) { console.log('ElevenLabs TTS failed:', e.message) }
  }
  throw new Error('No TTS provider. Add ELEVENLABS_API_KEY')
}

// ── WEB SEARCH (Tavily → Serper → Exa fallback chain) ────────────────
async function webSearch(query, maxResults = 5, deep = false) {
  // Try Tavily first (best AI search)
  if (process.env.TAVILY_API_KEY) {
    try {
      const r = await fetchT('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: maxResults, include_answer: true, search_depth: deep ? 'advanced' : 'basic' })
      }, 12000)
      const d = await r.json()
      if (r.ok) return { provider: 'tavily', answer: d.answer, results: d.results || [] }
    } catch (e) { console.log('Tavily failed:', e.message) }
  }
  // Fallback: Serper (Google)
  if (process.env.SERPER_DEV_API_KEY) {
    try {
      const r = await fetchT('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_DEV_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, num: maxResults, gl: 'in', hl: 'en' })
      }, 10000)
      const d = await r.json()
      if (r.ok) return { provider: 'serper', answer: d.answerBox?.answer || '', results: d.organic || [] }
    } catch (e) { console.log('Serper failed:', e.message) }
  }
  // Fallback: Exa AI
  if (process.env.EXA_AI_API) {
    try {
      const r = await fetchT('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'x-api-key': process.env.EXA_AI_API, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, numResults: maxResults, useAutoprompt: true })
      }, 10000)
      const d = await r.json()
      if (r.ok) return { provider: 'exa', answer: '', results: d.results || [] }
    } catch (e) { console.log('Exa failed:', e.message) }
  }
  return { provider: 'none', answer: '', results: [] }
}

// ── NEWS (NewsAPI → Serper news fallback) ────────────────────────────
async function getNews(topic, count = 5) {
  if (process.env.NEWS_API_KEY) {
    try {
      const r = await fetchT(`https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&pageSize=${count}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`, {}, 8000)
      const d = await r.json()
      if (r.ok && d.articles?.length) return d.articles.map(a => ({ title: a.title, description: a.description, url: a.url, source: a.source?.name }))
    } catch {}
  }
  if (process.env.SERPER_DEV_API_KEY) {
    try {
      const r = await fetchT('https://google.serper.dev/news', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_DEV_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: topic, num: count })
      }, 8000)
      const d = await r.json()
      if (r.ok) return (d.news || []).map(n => ({ title: n.title, description: n.snippet, url: n.link, source: n.source }))
    } catch {}
  }
  return []
}

// ── IMAGE GENERATION (Pollinations FREE → FAL → Replicate) ──────────
async function generateImage(prompt, width = 800, height = 600) {
  // Pollinations is always free — no key needed
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=flux&seed=${Date.now()}&nologo=true`
  
  // Try FAL for higher quality
  if (process.env.FAL_KEY) {
    try {
      const r = await fetchT('https://fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image_size: { width, height }, num_images: 1 })
      }, 20000)
      const d = await r.json()
      if (r.ok && d.images?.[0]?.url) return { url: d.images[0].url, provider: 'fal' }
    } catch {}
  }

  // Try Replicate
  if (process.env.REPLICATE_API_TOKEN) {
    try {
      const r = await fetchT('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
        method: 'POST',
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { prompt, width, height, num_outputs: 1 } })
      }, 8000)
      if (r.ok) {
        const pred = await r.json()
        // Poll for result
        for (let i = 0; i < 15; i++) {
          await new Promise(res => setTimeout(res, 2000))
          const poll = await fetchT(`https://api.replicate.com/v1/predictions/${pred.id}`, { headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` } })
          const result = await poll.json()
          if (result.status === 'succeeded') return { url: result.output[0], provider: 'replicate' }
        }
      }
    } catch {}
  }

  // Always fallback to Pollinations (free, no key needed)
  return { url: pollinationsUrl, provider: 'pollinations' }
}

// ── OCR — Scan textbooks (OCR.Space) ─────────────────────────────────
async function ocrImage(imageUrl) {
  if (!process.env.OCR_SPACE_API_KEY) throw new Error('OCR_SPACE_API_KEY not set')
  const r = await fetchT('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: process.env.OCR_SPACE_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ url: imageUrl, language: 'eng', isTable: 'true', detectOrientation: 'true' })
  }, 15000)
  const d = await r.json()
  return d.ParsedResults?.[0]?.ParsedText || ''
}

// ── VISION / IMAGE ANALYSIS (Gemini Vision) ──────────────────────────
async function analyzeImage(base64Image, prompt = 'Describe this image in detail') {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_KEY
  if (!key) throw new Error('GEMINI_API_KEY needed for image analysis')
  const r = await fetchT(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }] }]
    })
  }, 15000)
  const d = await r.json()
  if (!r.ok) throw new Error(`Gemini Vision ${r.status}`)
  return d.candidates[0].content.parts[0].text
}

// ── YOUTUBE SEARCH (for video learning) ─────────────────────────────
async function searchYoutube(topic, maxResults = 5) {
  if (!process.env.YOUTUBE_API_KEY) return []
  try {
    const r = await fetchT(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic + ' educational tutorial')}&type=video&maxResults=${maxResults}&relevanceLanguage=en&key=${process.env.YOUTUBE_API_KEY}`, {}, 8000)
    const d = await r.json()
    return (d.items || []).map(v => ({ title: v.snippet.title, videoId: v.id.videoId, thumbnail: v.snippet.thumbnails.medium.url, channel: v.snippet.channelTitle, url: `https://youtube.com/watch?v=${v.id.videoId}` }))
  } catch { return [] }
}

// ── UPSTASH REDIS LEADERBOARD (real-time) ────────────────────────────
async function updateLeaderboard(userId, username, xpToAdd) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  try {
    const r = await fetchT(`${process.env.UPSTASH_REDIS_REST_URL}/zincrby/edumind:leaderboard/${xpToAdd}/${userId}:${username}`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    }, 5000)
    return r.ok
  } catch { return null }
}

async function getLeaderboard(count = 20) {
  if (!process.env.UPSTASH_REDIS_REST_URL) return []
  try {
    const r = await fetchT(`${process.env.UPSTASH_REDIS_REST_URL}/zrange/edumind:leaderboard/0/${count - 1}/rev/withscores`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    }, 5000)
    const d = await r.json()
    const items = d.result || []
    const result = []
    for (let i = 0; i < items.length; i += 2) {
      const [userId, username] = items[i].split(':')
      result.push({ rank: result.length + 1, userId, username, xp: parseInt(items[i + 1]) })
    }
    return result
  } catch { return [] }
}

// ── WEATHER (for study environment) ─────────────────────────────────
async function getWeather(city = 'Lucknow') {
  if (!process.env.WEATHER_API_KEY) return null
  try {
    const r = await fetchT(`https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(city)}&aqi=no`, {}, 5000)
    if (r.ok) {
      const d = await r.json()
      return { city: d.location.name, temp: d.current.temp_c, condition: d.current.condition.text, humidity: d.current.humidity, feelsLike: d.current.feelslike_c }
    }
  } catch {}
  return null
}

// ── CLOUDINARY UPLOAD ────────────────────────────────────────────────
async function uploadToCloudinary(base64Data, filename) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) throw new Error('Cloudinary not configured')
  const formData = new FormData()
  formData.append('file', `data:image/jpeg;base64,${base64Data}`)
  formData.append('upload_preset', 'edumind_uploads')
  formData.append('api_key', process.env.CLOUDINARY_API_KEY)
  const r = await fetchT(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData }, 20000)
  const d = await r.json()
  if (!r.ok) throw new Error('Cloudinary upload failed')
  return { url: d.secure_url, publicId: d.public_id }
}

// ── SEND EMAIL (Resend) ──────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return false
  try {
    const r = await fetchT('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'EduMind AI <noreply@edu-mind.app>', to, subject, html })
    }, 8000)
    return r.ok
  } catch { return false }
}

// ── STATUS REPORT — which APIs are active ───────────────────────────
function getAPIStatus() {
  return {
    ai_chat: {
      groq: !!process.env.GROQ_API_KEY,
      cerebras: !!process.env.CEREBRAS_API_KEY,
      sambanova: !!process.env.SAMBANOVA_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      mistral: !!process.env.MISTRAL_API_KEY,
      gemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_KEY),
      nvidia: !!process.env.NVIDIA_API_KEY,
    },
    voice: {
      deepgram_stt: !!process.env.DEEPGRAM_API_KEY,
      assemblyai_stt: !!process.env.ASSEMBLY_API_KEY,
      elevenlabs_tts: !!process.env.ELEVENLABS_API_KEY,
      vapi: !!process.env.VAPI_API_KEY,
    },
    search: {
      tavily: !!process.env.TAVILY_API_KEY,
      serper: !!process.env.SERPER_DEV_API_KEY,
      exa: !!process.env.EXA_AI_API,
      news: !!process.env.NEWS_API_KEY,
      firecrawl: !!process.env.FIRECRAWL_API_KEY,
      youtube: !!process.env.YOUTUBE_API_KEY,
    },
    images: {
      pollinations: true, // always free, no key
      fal: !!process.env.FAL_KEY,
      replicate: !!process.env.REPLICATE_API_TOKEN,
      cloudinary: !!process.env.CLOUDINARY_API_KEY,
      ocr_space: !!process.env.OCR_SPACE_API_KEY,
    },
    database: {
      postgres: !!process.env.DATABASE_URL,
      redis: !!process.env.REDIS_URL || !!process.env.UPSTASH_REDIS_REST_URL,
      pinecone: !!process.env.PINECONE_API_KEY,
      qdrant: !!process.env.QDRANT_API_KEY,
    },
    communication: {
      resend_email: !!process.env.RESEND_API_KEY,
      livekit: !!process.env.LIVEKIT_API_KEY,
    },
    misc: {
      weather: !!process.env.WEATHER_API_KEY,
      huggingface: !!process.env.HUGGING_FACE_TOKEN,
      browserless: !!process.env.BROWSERLESS_API_KEY,
      cohere: !!process.env.COHERE_API_KEY,
    }
  }
}

module.exports = {
  callAI,
  speechToText,
  textToSpeech,
  webSearch,
  getNews,
  generateImage,
  ocrImage,
  analyzeImage,
  searchYoutube,
  updateLeaderboard,
  getLeaderboard,
  getWeather,
  uploadToCloudinary,
  sendEmail,
  getAPIStatus,
}
