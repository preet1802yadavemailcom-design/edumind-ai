import {useNavigate} from 'react-router-dom'
import {ArrowLeft,Brain,Users,Mail,MapPin,Phone,Rocket,Star,Heart,Briefcase,Globe,Shield,CheckCircle,Send,Loader} from 'lucide-react'
import {useState} from 'react'

function PublicLayout({children,hideBack}){
  const nav=useNavigate()
  return(
    <div style={{minHeight:'100vh',background:'#030712',color:'#e2e8f0',fontFamily:'Exo 2,sans-serif'}}>
      <nav style={{borderBottom:'0.5px solid rgba(255,255,255,0.06)',padding:'0 5%',height:56,display:'flex',alignItems:'center',gap:12,position:'sticky',top:0,background:'rgba(3,7,18,0.95)',backdropFilter:'blur(20px)',zIndex:100}}>
        {!hideBack&&<button onClick={()=>nav('/')} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:13,transition:'color .15s'}} onMouseEnter={e=>e.target.style.color='#e2e8f0'} onMouseLeave={e=>e.target.style.color='#64748b'}><ArrowLeft size={14}/> EduMind AI</button>}
        <div style={{flex:1}}/>
        <button onClick={()=>nav('/auth')} style={{padding:'6px 14px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:700}}>Launch App →</button>
      </nav>
      {children}
      <footer style={{borderTop:'0.5px solid rgba(255,255,255,0.06)',padding:'20px 5%',textAlign:'center',fontSize:12,color:'#334155'}}>
        © 2026 EduMind AI · Built by <a href="https://preetbeacon.com" style={{color:'#00d4ff',textDecoration:'none'}}>Preet Yadav</a> · <a href="/privacy" style={{color:'#475569',textDecoration:'none'}}>Privacy</a> · <a href="/terms" style={{color:'#475569',textDecoration:'none'}}>Terms</a>
      </footer>
    </div>
  )
}

function PageHero({emoji,title,sub,color='#00d4ff'}){
  return(
    <div style={{padding:'64px 5% 40px',textAlign:'center',maxWidth:700,margin:'0 auto'}}>
      <div style={{fontSize:48,marginBottom:12}}>{emoji}</div>
      <h1 style={{fontSize:36,fontWeight:800,color:'#e2e8f0',marginBottom:8}}>{title}</h1>
      <p style={{fontSize:16,color:'#64748b',lineHeight:1.7}}>{sub}</p>
    </div>
  )
}

// ── ABOUT PAGE ──────────────────────────────────────────────────────
export function AboutPage(){
  const nav=useNavigate()
  return(
    <PublicLayout>
      <PageHero emoji="🧠" title="About EduMind AI" sub="We believe every Indian student deserves world-class AI education — free, fast, and in their own language."/>
      <div style={{maxWidth:900,margin:'0 auto',padding:'0 5% 64px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:40}}>
          {[['🎯','Our Mission','Make quality AI education accessible to every student in India — from metro cities to rural villages.'],
            ['🌍','Our Vision','A world where no student is left behind due to lack of resources or guidance.'],
            ['⚡','What We Build','22 AI-powered modules covering learning, exam prep, career guidance, and institutional management.'],
            ['🇮🇳','Why India','500 million students in India. Most can\'t afford ₹40,000/year coaching. EduMind AI fixes this.']].map(([e,t,d])=>(
            <div key={t} style={{padding:'20px',borderRadius:14,border:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(5,13,28,0.4)'}}>
              <div style={{fontSize:28,marginBottom:8}}>{e}</div>
              <h3 style={{fontSize:15,fontWeight:700,color:'#e2e8f0',marginBottom:6}}>{t}</h3>
              <p style={{fontSize:13,color:'#64748b',lineHeight:1.7}}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{padding:'24px',borderRadius:14,border:'1px solid rgba(0,212,255,0.15)',background:'rgba(0,212,255,0.04)',marginBottom:32}}>
          <h2 style={{fontSize:20,fontWeight:700,color:'#e2e8f0',marginBottom:12}}>The Story</h2>
          <p style={{fontSize:14,color:'#94a3b8',lineHeight:1.8}}>
            EduMind AI was born from a simple observation: Indian students are brilliant, but lack access to quality, personalized guidance. Preet Yadav — a 2nd year CSE student at AKTU — built EduMind AI to solve this. Starting with a frontend prototype, he evolved it into a full-stack AI platform with 7 AI providers, 22 modules, and support for 6 languages. The platform is built on the same technology stack used by billion-dollar EdTech companies — but offered for free.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[['22+','AI Modules'],['7','AI Providers'],['₹0','To Start'],['100%','Student-Built']].map(([n,l])=>(
            <div key={l} style={{textAlign:'center',padding:'16px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.05)'}}>
              <div style={{fontSize:28,fontWeight:900,color:'#00d4ff',fontFamily:'Orbitron,monospace'}}>{n}</div>
              <div style={{fontSize:11,color:'#475569',marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}

// ── FOUNDER PAGE ─────────────────────────────────────────────────────
export function FounderPage(){
  return(
    <PublicLayout>
      <div style={{maxWidth:700,margin:'0 auto',padding:'64px 5%'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{width:100,height:100,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#00d4ff)',margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,fontWeight:900,color:'#fff',border:'3px solid rgba(0,212,255,0.3)'}}>P</div>
          <h1 style={{fontSize:32,fontWeight:800,color:'#e2e8f0',marginBottom:4}}>Preet Yadav</h1>
          <p style={{fontSize:14,color:'#00d4ff',marginBottom:4}}>Founder & CEO — EduMind AI</p>
          <p style={{fontSize:13,color:'#64748b'}}>Founder — Preet Beacon · 2nd Year CSE, AKTU · Uttar Pradesh, India</p>
        </div>
        <div style={{padding:'20px 24px',borderRadius:14,border:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(5,13,28,0.4)',marginBottom:20}}>
          <h2 style={{fontSize:16,fontWeight:700,color:'#e2e8f0',marginBottom:10}}>About Preet</h2>
          <p style={{fontSize:14,color:'#94a3b8',lineHeight:1.8,marginBottom:12}}>
            Preet Yadav is a second-year Computer Science Engineering student at Dr. A.P.J. Abdul Kalam Technical University (AKTU). At 19, he founded Preet Beacon — a platform with 30+ free tools for students — and went on to build EduMind AI, India's most technically advanced AI education platform.
          </p>
          <p style={{fontSize:14,color:'#94a3b8',lineHeight:1.8}}>
            With a stack of 35+ API integrations, 7 AI provider rotation, Redis caching, PostgreSQL backend, and 22 fully functional AI modules, EduMind AI represents what a passionate, resourceful student can build. Preet's mission is to level the playing field — giving every Indian student access to the same quality of AI guidance that was previously only available to those who could afford it.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
          {[['🏛️','AKTU','B.Tech CSE — 2nd Year'],['🚀','Preet Beacon','30+ free student tools'],['🧠','EduMind AI','22 AI modules, 7 AI providers'],['🏆','Hackathons','Multiple winners, active competitor']].map(([e,t,d])=>(
            <div key={t} style={{padding:'14px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.02)'}}>
              <div style={{fontSize:20,marginBottom:4}}>{e}</div>
              <div style={{fontSize:12,fontWeight:700,color:'#e2e8f0'}}>{t}</div>
              <div style={{fontSize:11,color:'#475569'}}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {[['🌐 Preet Beacon','https://preetbeacon.com'],['💼 LinkedIn','#'],['🐦 Twitter','#'],['📧 Email','mailto:preet@edu-mind.app']].map(([l,h])=>(
            <a key={l} href={h} target={h.startsWith('http')?'_blank':'_self'} rel="noopener noreferrer" style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',color:'#94a3b8',textDecoration:'none',fontSize:12,transition:'color .15s'}}
              onMouseEnter={e=>e.target.style.color='#e2e8f0'}onMouseLeave={e=>e.target.style.color='#94a3b8'}>{l}</a>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}

// ── CONTACT PAGE ─────────────────────────────────────────────────────
export function ContactPage(){
  const[form,setForm]=useState({name:'',email:'',subject:'',message:''})
  const[sent,setSent]=useState(false)
  const[loading,setLoading]=useState(false)

  async function submit(e){
    e.preventDefault()
    if(!form.name||!form.email||!form.message) return
    setLoading(true)
    // Simulate sending (backend endpoint can be added)
    await new Promise(r=>setTimeout(r,1500))
    setSent(true)
    setLoading(false)
  }

  return(
    <PublicLayout>
      <PageHero emoji="📬" title="Contact Us" sub="Have a question, bug report, or partnership idea? We read every message."/>
      <div style={{maxWidth:800,margin:'0 auto',padding:'0 5% 64px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:'#e2e8f0',marginBottom:16}}>Get in Touch</h2>
          {[['📧','General','hello@edu-mind.app'],['🛠️','Support','support@edu-mind.app'],['💼','Business','business@edu-mind.app'],['⚖️','Legal','legal@edu-mind.app'],['💳','Billing','billing@edu-mind.app']].map(([e,t,m])=>(
            <div key={t} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 0',borderBottom:'0.5px solid rgba(255,255,255,0.04)'}}>
              <span style={{fontSize:18}}>{e}</span>
              <div><div style={{fontSize:12,fontWeight:600,color:'#e2e8f0'}}>{t}</div><div style={{fontSize:12,color:'#00d4ff'}}>{m}</div></div>
            </div>
          ))}
          <div style={{marginTop:20,padding:'14px',borderRadius:10,border:'0.5px solid rgba(0,212,255,0.15)',background:'rgba(0,212,255,0.04)'}}>
            <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>RESPONSE TIME</div>
            <div style={{fontSize:13,color:'#94a3b8'}}>We typically respond within 24 hours. For urgent issues, mention "URGENT" in subject.</div>
          </div>
        </div>
        <div>
          {sent?(
            <div style={{textAlign:'center',padding:'40px 20px'}}>
              <div style={{fontSize:48,marginBottom:12}}>✅</div>
              <h3 style={{fontSize:18,fontWeight:700,color:'#e2e8f0',marginBottom:8}}>Message Sent!</h3>
              <p style={{fontSize:13,color:'#64748b'}}>We'll get back to you within 24 hours at {form.email}</p>
            </div>
          ):(
            <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
              {[['Your Name','name','text'],['Your Email','email','email'],['Subject','subject','text']].map(([pl,k,t])=>(
                <input key={k} type={t} placeholder={pl} required={k!=='subject'} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  style={{width:'100%',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'10px 14px',color:'#e2e8f0',fontSize:13,fontFamily:'Exo 2,sans-serif',outline:'none'}}/>
              ))}
              <textarea placeholder="Your message..." required value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                style={{width:'100%',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'10px 14px',color:'#e2e8f0',fontSize:13,fontFamily:'Exo 2,sans-serif',outline:'none',minHeight:120,resize:'vertical'}}/>
              <button type="submit" disabled={loading} style={{padding:'11px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'#fff',cursor:loading?'not-allowed':'pointer',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:loading?0.7:1}}>
                {loading?<><Loader size={14} style={{animation:'spin 1s linear infinite'}}/> Sending...</>:<><Send size={14}/> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

// ── CAREERS PAGE ─────────────────────────────────────────────────────
export function CareersPage(){
  const nav=useNavigate()
  const roles=[
    {title:'Frontend Developer (React)',type:'Remote · Intern/Part-time',skills:['React','TailwindCSS','TypeScript'],desc:'Help build and improve EduMind AI\'s UI. Passion for clean design required.'},
    {title:'AI/ML Engineer',type:'Remote · Intern',skills:['Python','LangChain','Prompt Engineering'],desc:'Work on AI feature improvements, prompt optimization, and new AI integrations.'},
    {title:'Growth & Marketing',type:'Remote · Commission-based',skills:['Social Media','SEO','Content'],desc:'Help spread EduMind AI across colleges. Build ambassador networks.'},
    {title:'Campus Ambassador',type:'Any college · Part-time',skills:['Communication','Networking'],desc:'Be the EduMind AI rep at your college. Free Pro + commission on referrals.'},
  ]
  return(
    <PublicLayout>
      <PageHero emoji="🚀" title="Join EduMind AI" sub="We're a small but mighty team building India's most advanced AI education platform. Come build with us."/>
      <div style={{maxWidth:800,margin:'0 auto',padding:'0 5% 64px'}}>
        <div style={{padding:'16px 20px',borderRadius:10,border:'1px solid rgba(0,212,255,0.15)',background:'rgba(0,212,255,0.04)',marginBottom:28,fontSize:13,color:'#94a3b8',lineHeight:1.7}}>
          We're a student-founded startup. We offer learning, ownership, and the experience of building a real product from scratch. Compensation grows with the platform. Equity possible for core contributors.
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
          {roles.map(r=>(
            <div key={r.title} style={{padding:'20px',borderRadius:12,border:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(5,13,28,0.4)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,flexWrap:'wrap',gap:6}}>
                <h3 style={{fontSize:15,fontWeight:700,color:'#e2e8f0'}}>{r.title}</h3>
                <span style={{fontSize:11,color:'#00d4ff',padding:'3px 10px',borderRadius:20,background:'rgba(0,212,255,0.08)',border:'0.5px solid rgba(0,212,255,0.15)'}}>{r.type}</span>
              </div>
              <p style={{fontSize:13,color:'#64748b',marginBottom:10,lineHeight:1.6}}>{r.desc}</p>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {r.skills.map(s=><span key={s} style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:'rgba(255,255,255,0.04)',color:'#64748b',border:'0.5px solid rgba(255,255,255,0.06)'}}>{s}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center'}}>
          <p style={{fontSize:13,color:'#64748b',marginBottom:12}}>To apply, email your LinkedIn or GitHub to:</p>
          <div style={{fontSize:16,color:'#00d4ff',fontWeight:700}}>careers@edu-mind.app</div>
          <p style={{fontSize:12,color:'#334155',marginTop:8}}>Subject: "[Role] — [Your Name] — [College]"</p>
        </div>
      </div>
    </PublicLayout>
  )
}

// ── FAQ PAGE ─────────────────────────────────────────────────────────
export function FAQPage(){
  const faqs=[
    {q:'Is EduMind AI really free?',a:'Yes. Free tier gives 20 AI queries/day, quiz generator, flashcards, and basic modules. No credit card needed ever.'},
    {q:'Which exams does it support?',a:'JEE, NEET, GATE, UPSC, CAT, CLAT, AKTU, CBSE, ICSE, State Boards, and any topic-based learning globally.'},
    {q:'Can I use it in Hindi?',a:'Yes! Voice solver supports Hindi+English speech. The AI can explain concepts in Hinglish. Full Hindi UI support is coming.'},
    {q:'Is my data safe?',a:'Completely. Passwords are bcrypt-hashed, all connections are HTTPS, API keys are server-side only, GDPR compliant.'},
    {q:'What AI models are used?',a:'7 providers rotate automatically: Groq (llama-3.3-70b), Gemini 1.5 Flash, Sambanova, OpenRouter, Mistral, NVIDIA, Cerebras. Always fast.'},
    {q:'Who built this?',a:'Preet Yadav — 2nd year CSE student at AKTU, founder of Preet Beacon (preetbeacon.com). Built solo in weeks.'},
    {q:'How is this better than ChatGPT?',a:'EduMind AI is education-specific: exam-focused content, Indian curriculum awareness, XP gamification, voice in Hindi, quiz generator, interview prep — ChatGPT is general purpose.'},
    {q:'Can my school/college use it?',a:'Yes! Institution plan at ₹4,999/month includes teacher dashboard, student management, attendance, parent portal, and custom branding.'},
    {q:'Does it work offline?',a:'Satellite Mode is optimized for 2G/low-bandwidth. Full offline mode is on our roadmap.'},
    {q:'How do I cancel Pro?',a:'Settings → Subscription → Cancel. No hassle, instant. Data retained for 30 days after cancellation.'},
  ]
  return(
    <PublicLayout>
      <PageHero emoji="❓" title="Frequently Asked Questions" sub="Everything you need to know about EduMind AI."/>
      <div style={{maxWidth:720,margin:'0 auto',padding:'0 5% 64px'}}>
        {faqs.map((f,i)=>(
          <details key={i} style={{marginBottom:8,borderRadius:10,border:'0.5px solid rgba(255,255,255,0.06)',overflow:'hidden'}}>
            <summary style={{padding:'14px 18px',cursor:'pointer',fontSize:14,fontWeight:600,color:'#e2e8f0',background:'rgba(5,13,28,0.6)',listStyle:'none',userSelect:'none'}}>{f.q}</summary>
            <div style={{padding:'12px 18px',fontSize:13,color:'#94a3b8',lineHeight:1.7,background:'rgba(5,13,28,0.3)'}}>{f.a}</div>
          </details>
        ))}
        <div style={{textAlign:'center',marginTop:32}}>
          <p style={{fontSize:13,color:'#64748b',marginBottom:8}}>Still have questions?</p>
          <a href="/contact" style={{color:'#00d4ff',fontSize:14,textDecoration:'none',fontWeight:600}}>Contact Support →</a>
        </div>
      </div>
    </PublicLayout>
  )
}

// ── BLOG PAGE ────────────────────────────────────────────────────────
export function BlogPage(){
  const nav=useNavigate()
  const posts=[
    {title:'How I Built India\'s No.1 AI Education Platform as a 2nd Year Student',date:'June 7, 2026',tag:'Story',read:'8 min',desc:'The journey from a simple React app to a full-stack AI platform with 35+ API integrations. Built by Preet Yadav.'},
    {title:'7 AI Study Techniques That Actually Work (Backed by Neuroscience)',date:'June 5, 2026',tag:'Study Tips',read:'6 min',desc:'How spaced repetition, active recall, and the Feynman technique can double your retention in half the time.'},
    {title:'JEE 2027 Preparation Strategy: AI-Powered Roadmap',date:'June 3, 2026',tag:'JEE',read:'10 min',desc:'Complete month-by-month JEE preparation plan using EduMind AI features — quiz generator, adaptive recap, study schedule.'},
    {title:'Why Indian Students Need AI Education (Not Just Online Videos)',date:'June 1, 2026',tag:'EdTech',read:'5 min',desc:'The gap between what Indian students need and what current EdTech platforms offer. And how AI fills it.'},
    {title:'How to Ace Technical Interviews with AI Mock Practice',date:'May 28, 2026',tag:'Career',read:'7 min',desc:'Using EduMind AI\'s interview prep module to practice FAANG-style questions with real AI feedback.'},
    {title:'Preet Beacon: Building 30+ Free Tools for Students',date:'May 20, 2026',tag:'Preet Beacon',read:'4 min',desc:'The story behind preetbeacon.com and why free tools for students matter more than ever.'},
  ]
  const COLORS={Story:'#00d4ff',JEE:'#ffd700',EdTech:'#7c3aed','Study Tips':'#00ff88',Career:'#f97316','Preet Beacon':'#ec4899'}
  return(
    <PublicLayout>
      <PageHero emoji="📝" title="EduMind AI Blog" sub="Study tips, AI education insights, JEE/NEET prep, and stories from the builder."/>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'0 5% 64px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
        {posts.map(p=>(
          <div key={p.title} style={{padding:'20px',borderRadius:14,border:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(5,13,28,0.4)',cursor:'pointer',transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,212,255,0.2)';e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.06)';e.currentTarget.style.transform='translateY(0)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:`${COLORS[p.tag]||'#00d4ff'}15`,color:COLORS[p.tag]||'#00d4ff',fontWeight:600}}>{p.tag}</span>
              <span style={{fontSize:10,color:'#334155'}}>{p.read} read</span>
            </div>
            <h3 style={{fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:8,lineHeight:1.5}}>{p.title}</h3>
            <p style={{fontSize:12,color:'#475569',lineHeight:1.6,marginBottom:10}}>{p.desc}</p>
            <div style={{fontSize:10,color:'#334155'}}>{p.date} · Preet Yadav</div>
          </div>
        ))}
      </div>
    </PublicLayout>
  )
}

// ── 404 PAGE ─────────────────────────────────────────────────────────
export function NotFoundPage(){
  const nav=useNavigate()
  return(
    <div style={{minHeight:'100vh',background:'#030712',color:'#e2e8f0',fontFamily:'Exo 2,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'5%'}}>
      <div>
        <div style={{fontSize:80,fontWeight:900,color:'rgba(0,212,255,0.15)',fontFamily:'Orbitron,monospace',marginBottom:-20}}>404</div>
        <div style={{fontSize:40,marginBottom:16}}>🌌</div>
        <h1 style={{fontSize:24,fontWeight:700,color:'#e2e8f0',marginBottom:8}}>Page Not Found</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:24,maxWidth:400,margin:'0 auto 24px'}}>This page doesn't exist in our universe. But your learning journey doesn't have to stop here.</p>
        <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>nav('/')} style={{padding:'10px 20px',borderRadius:10,border:'1px solid rgba(0,212,255,0.2)',background:'transparent',color:'#00d4ff',cursor:'pointer',fontSize:13,fontWeight:600}}>← Home</button>
          <button onClick={()=>nav('/auth')} style={{padding:'10px 20px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:700}}>Launch App →</button>
        </div>
      </div>
    </div>
  )
}

// ── PARTNERS PAGE ────────────────────────────────────────────────────
export function PartnersPage(){
  return(
    <PublicLayout>
      <PageHero emoji="🤝" title="Partners & Sponsors" sub="Organizations and tools that power EduMind AI's mission."/>
      <div style={{maxWidth:900,margin:'0 auto',padding:'0 5% 64px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12,marginBottom:40}}>
          {[['⚡','Groq','Ultra-fast AI inference'],['🔵','Vercel','Frontend hosting'],['🚂','Railway','Backend hosting'],['🌊','Neon','PostgreSQL database'],['🔴','Upstash','Redis cache'],['🎨','Cloudinary','Media storage'],['🔍','Tavily','AI web search'],['🎙️','Deepgram','Voice AI'],['🔊','ElevenLabs','Text to speech'],['📌','Pinecone','Vector database']].map(([e,n,d])=>(
            <div key={n} style={{padding:'16px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(5,13,28,0.4)',textAlign:'center'}}>
              <div style={{fontSize:24,marginBottom:6}}>{e}</div>
              <div style={{fontSize:13,fontWeight:700,color:'#e2e8f0',marginBottom:3}}>{n}</div>
              <div style={{fontSize:10,color:'#475569'}}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',padding:'24px',borderRadius:14,border:'1px solid rgba(0,212,255,0.15)',background:'rgba(0,212,255,0.04)'}}>
          <h3 style={{fontSize:16,fontWeight:700,color:'#e2e8f0',marginBottom:8}}>Interested in Partnering?</h3>
          <p style={{fontSize:13,color:'#64748b',marginBottom:12}}>We're open to partnerships with EdTech companies, coaching institutes, and developer tools.</p>
          <a href="mailto:business@edu-mind.app" style={{color:'#00d4ff',fontSize:14,fontWeight:600,textDecoration:'none'}}>business@edu-mind.app →</a>
        </div>
      </div>
    </PublicLayout>
  )
}
