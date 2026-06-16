import {useNavigate} from 'react-router-dom'
import {Brain,Zap,Target,BookOpen,Globe,Mic,Trophy,Star,ArrowRight,CheckCircle,Users,TrendingUp,Shield,Code,Rocket,ChevronDown} from 'lucide-react'

const FEATURES=[
  {icon:Brain,title:'AGI Mentor',desc:'Chat with 4 AI personas — Einstein, Feynman, APJ Kalam & Senior. Instant answers, markdown, voice.',color:'#00d4ff'},
  {icon:Zap,title:'Quiz Generator',desc:'AI generates MCQs on any topic in seconds. 3 difficulty levels, instant scoring, XP rewards.',color:'#ffd700'},
  {icon:Target,title:'Interview Prep',desc:'HR, Technical & Coding interviews with AI evaluation. Real FAANG-style questions + feedback.',color:'#7c3aed'},
  {icon:BookOpen,title:'Smart Flashcards',desc:'Spaced repetition system. Generate cards on any topic, flip & rate — hard/good/easy.',color:'#ec4899'},
  {icon:Globe,title:'Research Agent',desc:'Real-time web search + news + AI synthesis. Citations included. Like having a research assistant.',color:'#14b8a6'},
  {icon:Mic,title:'Voice Solver',desc:'Speak your doubt in Hindi or English. Deepgram STT + ElevenLabs TTS. Hands-free learning.',color:'#f43f5e'},
  {icon:Trophy,title:'Gamification',desc:'XP points, streak tracker, badges, leagues & leaderboard. Make studying addictive.',color:'#f59e0b'},
  {icon:Code,title:'Study Schedule',desc:'AI-generated personalized timetable for JEE/NEET/GATE/UPSC with spaced repetition.',color:'#00ff88'},
]

const STATS=[
  {n:'22+',l:'AI Modules'},
  {n:'7',l:'AI Providers'},
  {n:'6',l:'Languages'},
  {n:'₹0',l:'To Start'},
]

const TESTIMONIALS=[
  {name:'Aryan Singh',role:'JEE Aspirant, Delhi',text:'EduMind AI ka AGI Mentor ne meri Physics clear kar di. Einstein Mode mein explain karta hai ekdum depth mein. Best platform hai yaar!',stars:5},
  {name:'Priya Sharma',role:'NEET Prep, Mumbai',text:'Quiz generator is insane. I generated 200 biology questions in 10 minutes. Scored 95% in my mock test after using it for 2 weeks.',stars:5},
  {name:'Rohit Kumar',role:'CSE Student, AKTU',text:'Interview prep feature ne mujhe Amazon mein place karaya. AI feedback bahut accurate tha. Highly recommend!',stars:5},
  {name:'Sneha Patel',role:'CA Aspirant, Surat',text:'Research agent saves me 3 hours daily. I get cited, well-structured summaries in minutes. Game changer for CA prep.',stars:5},
]

const PRICING=[
  {name:'Free',price:'₹0',period:'forever',color:'#64748b',features:['20 AI queries/day','Basic quiz generator','5 flashcard sets','1 language','Community access'],cta:'Start Free',popular:false},
  {name:'Student Pro',price:'₹199',period:'/month',color:'#00d4ff',features:['Unlimited AI queries','All 22 modules','Voice solver (Hindi+English)','6 languages','Personal AI memory','PDF exports','Priority support'],cta:'Start Pro',popular:true},
  {name:'Institution',price:'₹4,999',period:'/month',color:'#ffd700',features:['Unlimited students','Teacher dashboard','Live classroom','Attendance system','Parent portal','Custom branding','Dedicated support'],cta:'Contact Us',popular:false},
]

const FAQS=[
  {q:'Is EduMind AI really free?',a:'Yes! The free tier gives you 20 AI queries per day, quiz generator, and basic modules. No credit card needed.'},
  {q:'Which exams does EduMind AI support?',a:'JEE, NEET, GATE, UPSC, CAT, AKTU, CBSE, ICSE, and any topic-based learning. The AI adapts to whatever you need.'},
  {q:'Is my data safe?',a:'Yes. All data is encrypted, API keys are server-side only, and we follow GDPR compliance. Your data is never sold.'},
  {q:'Can I use it in Hindi?',a:'Absolutely! Voice solver supports Hindi+English. AI Mentor can explain in Hinglish. Multi-language support built in.'},
  {q:'Who built EduMind AI?',a:'Preet Yadav — founder of Preet Beacon (preetbeacon.com), 2nd year CSE student at AKTU. Built to solve real problems Indian students face.'},
  {q:'What AI models power EduMind?',a:'7 AI providers rotate automatically: Groq (llama-3.3-70b), Gemini 1.5, Sambanova, OpenRouter, Mistral, NVIDIA, Cerebras. Always fast, always available.'},
]

export default function LandingPage(){
  const nav=useNavigate()
  const S={background:'#030712',color:'#e2e8f0',fontFamily:'Exo 2, sans-serif'}

  return(
    <div style={S}>
      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,backdropFilter:'blur(20px)',background:'rgba(3,7,18,0.9)',borderBottom:'0.5px solid rgba(255,255,255,0.06)',padding:'0 5%'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',height:60,gap:20}}>
          <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>window.scrollTo(0,0)}>
            <div style={{width:32,height:32,background:'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(124,58,237,0.2))',border:'1px solid rgba(0,212,255,0.3)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Brain size={16} style={{color:'#00d4ff'}}/>
            </div>
            <span style={{fontSize:16,fontWeight:800,background:'linear-gradient(135deg,#00d4ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>EduMind AI</span>
          </div>
          <div style={{flex:1,display:'flex',gap:24,justifyContent:'center'}}>
            {[['#features','Features'],['#pricing','Pricing'],['#testimonials','Reviews'],['#faq','FAQ']].map(([h,l])=>(
              <a key={h} href={h} style={{fontSize:13,color:'#64748b',textDecoration:'none',transition:'color .15s'}}
                onMouseEnter={e=>e.target.style.color='#e2e8f0'}onMouseLeave={e=>e.target.style.color='#64748b'}>{l}</a>
            ))}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>nav('/auth')} style={{padding:'7px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#94a3b8',cursor:'pointer',fontSize:12,fontWeight:600}}>Login</button>
            <button onClick={()=>nav('/auth')} style={{padding:'7px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:700}}>Start Free →</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{padding:'100px 5% 80px',textAlign:'center',maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:20,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.2)',marginBottom:24,fontSize:12,color:'#00d4ff',fontWeight:600}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#00ff88',display:'inline-block',boxShadow:'0 0 8px #00ff88'}}/>
          Now Live — Built by Preet Yadav · Preet Beacon
        </div>
        <h1 style={{fontSize:'clamp(32px,5vw,60px)',fontWeight:900,lineHeight:1.1,marginBottom:20,fontFamily:'Orbitron, monospace'}}>
          India's <span style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>No.1 AI</span><br/>Education Platform
        </h1>
        <p style={{fontSize:18,color:'#64748b',maxWidth:600,margin:'0 auto 32px',lineHeight:1.7}}>
          22 AI modules for Indian students. AGI Mentor, Quiz Generator, Interview Prep, Research Agent, Voice Solver & more. <strong style={{color:'#e2e8f0'}}>100% free to start.</strong>
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:48}}>
          <button onClick={()=>nav('/auth')} style={{padding:'14px 32px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'#fff',cursor:'pointer',fontSize:16,fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
            <Rocket size={16}/> Start Learning Free
          </button>
          <button onClick={()=>document.getElementById('features').scrollIntoView({behavior:'smooth'})} style={{padding:'14px 32px',borderRadius:12,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#94a3b8',cursor:'pointer',fontSize:16,fontWeight:600,display:'flex',alignItems:'center',gap:8}}>
            See Features <ChevronDown size={16}/>
          </button>
        </div>
        {/* Stats */}
        <div style={{display:'flex',gap:32,justifyContent:'center',flexWrap:'wrap'}}>
          {STATS.map(s=>(
            <div key={s.l} style={{textAlign:'center'}}>
              <div style={{fontSize:32,fontWeight:900,color:'#00d4ff',fontFamily:'Orbitron, monospace'}}>{s.n}</div>
              <div style={{fontSize:12,color:'#475569'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:'80px 5%',background:'rgba(255,255,255,0.01)'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <h2 style={{fontSize:36,fontWeight:800,textAlign:'center',marginBottom:8}}>22 AI Modules. Zero Compromise.</h2>
          <p style={{textAlign:'center',color:'#475569',marginBottom:48,fontSize:15}}>Every feature powered by real AI — not fake demos.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {FEATURES.map(f=>(
              <div key={f.title} style={{padding:'20px',borderRadius:14,border:`1px solid ${f.color}18`,background:`${f.color}06`,transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=`${f.color}40`;e.currentTarget.style.transform='translateY(-4px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${f.color}18`;e.currentTarget.style.transform='translateY(0)'}}>
                <f.icon size={24} style={{color:f.color,marginBottom:10}}/>
                <h3 style={{fontSize:15,fontWeight:700,marginBottom:6,color:'#e2e8f0'}}>{f.title}</h3>
                <p style={{fontSize:13,color:'#64748b',lineHeight:1.6}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{padding:'80px 5%'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <h2 style={{fontSize:36,fontWeight:800,textAlign:'center',marginBottom:8}}>Students Love It</h2>
          <p style={{textAlign:'center',color:'#475569',marginBottom:48,fontSize:15}}>Real reviews from real Indian students.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {TESTIMONIALS.map(t=>(
              <div key={t.name} style={{padding:'20px',borderRadius:14,border:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(5,13,28,0.6)'}}>
                <div style={{display:'flex',gap:2,marginBottom:10}}>
                  {[...Array(t.stars)].map((_,i)=><Star key={i} size={12} style={{color:'#ffd700',fill:'#ffd700'}}/>)}
                </div>
                <p style={{fontSize:13,color:'#94a3b8',lineHeight:1.7,marginBottom:14,fontStyle:'italic'}}>"{t.text}"</p>
                <div style={{fontSize:12,fontWeight:700,color:'#e2e8f0'}}>{t.name}</div>
                <div style={{fontSize:11,color:'#475569'}}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:'80px 5%',background:'rgba(255,255,255,0.01)'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <h2 style={{fontSize:36,fontWeight:800,textAlign:'center',marginBottom:8}}>Simple, Honest Pricing</h2>
          <p style={{textAlign:'center',color:'#475569',marginBottom:48,fontSize:15}}>Start free. Upgrade when you need more.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
            {PRICING.map(p=>(
              <div key={p.name} style={{padding:'24px',borderRadius:16,border:`2px solid ${p.popular?p.color:'rgba(255,255,255,0.06)'}`,background:p.popular?`${p.color}08`:'rgba(5,13,28,0.4)',position:'relative'}}>
                {p.popular&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#000',fontSize:10,fontWeight:800,padding:'3px 12px',borderRadius:20,whiteSpace:'nowrap'}}>MOST POPULAR</div>}
                <div style={{fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:4}}>{p.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:20}}>
                  <span style={{fontSize:32,fontWeight:900,color:p.color}}>{p.price}</span>
                  <span style={{fontSize:12,color:'#475569'}}>{p.period}</span>
                </div>
                <div style={{marginBottom:20}}>
                  {p.features.map(f=>(
                    <div key={f} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8}}>
                      <CheckCircle size={13} style={{color:'#00ff88',marginTop:1,flexShrink:0}}/>
                      <span style={{fontSize:12,color:'#94a3b8'}}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>nav(p.name==='Institution'?'/contact':'/auth')}
                  style={{width:'100%',padding:'10px',borderRadius:10,border:'none',background:p.popular?`linear-gradient(135deg,${p.color},#7c3aed)`:'rgba(255,255,255,0.05)',color:p.popular?'#fff':'#94a3b8',cursor:'pointer',fontSize:13,fontWeight:700}}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{padding:'80px 5%'}}>
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <h2 style={{fontSize:36,fontWeight:800,textAlign:'center',marginBottom:8}}>Frequently Asked Questions</h2>
          <p style={{textAlign:'center',color:'#475569',marginBottom:48,fontSize:15}}>Got questions? We have answers.</p>
          {FAQS.map((f,i)=>(
            <details key={i} style={{marginBottom:10,borderRadius:12,border:'0.5px solid rgba(255,255,255,0.06)',overflow:'hidden'}}>
              <summary style={{padding:'16px 20px',cursor:'pointer',fontSize:14,fontWeight:600,color:'#e2e8f0',background:'rgba(5,13,28,0.6)',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                {f.q}<ChevronDown size={14} style={{color:'#475569',flexShrink:0}}/>
              </summary>
              <div style={{padding:'14px 20px',fontSize:13,color:'#94a3b8',lineHeight:1.7,background:'rgba(5,13,28,0.3)'}}>{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* FOUNDER */}
      <section style={{padding:'80px 5%',background:'rgba(255,255,255,0.01)'}}>
        <div style={{maxWidth:700,margin:'0 auto',textAlign:'center'}}>
          <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#00d4ff)',margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:900,color:'#fff'}}>P</div>
          <h2 style={{fontSize:28,fontWeight:800,marginBottom:8}}>Built by <span style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Preet Yadav</span></h2>
          <p style={{fontSize:14,color:'#64748b',marginBottom:16,lineHeight:1.7}}>
            Founder of <a href="https://preetbeacon.com" target="_blank" rel="noopener noreferrer" style={{color:'#00d4ff',textDecoration:'none'}}>Preet Beacon</a> — a platform with 30+ free tools for students. 2nd year CSE student at AKTU who believes every Indian student deserves world-class AI education. EduMind AI is built to level the playing field.
          </p>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            {[['🌐 Preet Beacon','https://preetbeacon.com'],['💼 LinkedIn','/founder'],['🐦 Twitter','#']].map(([l,h])=>(
              <a key={l} href={h} style={{padding:'7px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',color:'#94a3b8',textDecoration:'none',fontSize:12,transition:'color .15s'}}
                onMouseEnter={e=>e.target.style.color='#e2e8f0'}onMouseLeave={e=>e.target.style.color='#94a3b8'}>{l}</a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section style={{padding:'80px 5%',textAlign:'center'}}>
        <h2 style={{fontSize:40,fontWeight:900,marginBottom:12,fontFamily:'Orbitron,monospace'}}>
          Ready to <span style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Excel?</span>
        </h2>
        <p style={{color:'#475569',marginBottom:28,fontSize:16}}>Join thousands of Indian students already using EduMind AI.</p>
        <button onClick={()=>nav('/auth')} style={{padding:'16px 40px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'#fff',cursor:'pointer',fontSize:18,fontWeight:700,display:'inline-flex',alignItems:'center',gap:10}}>
          <Rocket size={18}/> Start Free Today — No Card Needed
        </button>
        <p style={{marginTop:16,fontSize:12,color:'#334155'}}>Built by Preet Yadav · Preet Beacon · edu-mind.app</p>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'0.5px solid rgba(255,255,255,0.06)',padding:'40px 5%'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:32,marginBottom:32}}>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:'#e2e8f0',marginBottom:12,fontFamily:'Orbitron,monospace'}}>EduMind AI</div>
              <p style={{fontSize:12,color:'#475569',lineHeight:1.7}}>India's No.1 AI Education Platform. Built by Preet Yadav for Indian students.</p>
              <a href="https://preetbeacon.com" style={{fontSize:12,color:'#00d4ff',textDecoration:'none',display:'block',marginTop:8}}>→ Preet Beacon</a>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#64748b',marginBottom:12,letterSpacing:'0.06em'}}>PRODUCT</div>
              {[['Features','#features'],['Pricing','#pricing'],['FAQ','#faq'],['Blog','/blog'],['Roadmap','#']].map(([l,h])=>(
                <a key={l} href={h} style={{display:'block',fontSize:12,color:'#475569',textDecoration:'none',marginBottom:7,transition:'color .15s'}}
                  onMouseEnter={e=>e.target.style.color='#94a3b8'}onMouseLeave={e=>e.target.style.color='#475569'}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#64748b',marginBottom:12,letterSpacing:'0.06em'}}>COMPANY</div>
              {[['About Us','/about'],['Founder','/founder'],['Careers','/careers'],['Contact','/contact'],['Partners','/partners']].map(([l,h])=>(
                <a key={l} href={h} style={{display:'block',fontSize:12,color:'#475569',textDecoration:'none',marginBottom:7,transition:'color .15s'}}
                  onMouseEnter={e=>e.target.style.color='#94a3b8'}onMouseLeave={e=>e.target.style.color='#475569'}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#64748b',marginBottom:12,letterSpacing:'0.06em'}}>LEGAL</div>
              {[['Privacy Policy','/privacy'],['Terms & Conditions','/terms'],['Refund Policy','/refund'],['Cookie Policy','/cookie'],['DMCA','/dmca']].map(([l,h])=>(
                <a key={l} href={h} style={{display:'block',fontSize:12,color:'#475569',textDecoration:'none',marginBottom:7,transition:'color .15s'}}
                  onMouseEnter={e=>e.target.style.color='#94a3b8'}onMouseLeave={e=>e.target.style.color='#475569'}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{borderTop:'0.5px solid rgba(255,255,255,0.04)',paddingTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div style={{fontSize:12,color:'#334155'}}>© 2026 EduMind AI · edu-mind.app · All rights reserved · Built by <a href="https://preetbeacon.com" style={{color:'#00d4ff',textDecoration:'none'}}>Preet Yadav</a></div>
            <div style={{fontSize:12,color:'#334155',display:'flex',gap:16}}>
              <span>🇮🇳 Made in India</span>
              <span>🔒 HTTPS Secure</span>
              <span>⚡ 7 AI Providers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
