import {useState,useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth,useGame,useLearn,useUI} from '../lib/store'
import {getLeague,getLevelXP,fmtXP,PERF_DATA} from '../lib/api'
import {Brain,Zap,Target,BookOpen,Mic,FlaskConical,Trophy,Rocket,Code,FileText,Calendar,Globe,Users,Shield,Satellite,Cpu,Layers,BarChart3,TrendingUp,Star,Flame,Clock,ChevronRight,Play,Plus} from 'lucide-react'
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,RadarChart,PolarGrid,PolarAngleAxis,Radar} from 'recharts'

const MODULES=[
  {id:'agi-mentor',icon:Brain,label:'AGI Mentor',sub:'4 AI Personas',color:'#00d4ff',glow:'rgba(0,212,255,0.15)',hot:true},
  {id:'quiz',icon:Zap,label:'Quiz Generator',sub:'Any Topic',color:'#ffd700',glow:'rgba(255,215,0,0.12)'},
  {id:'ai-interview',icon:Target,label:'Interview Prep',sub:'HR + Tech + Code',color:'#7c3aed',glow:'rgba(124,58,237,0.15)'},
  {id:'schedule',icon:Calendar,label:'Study Schedule',sub:'AI Planner',color:'#00ff88',glow:'rgba(0,255,136,0.12)'},
  {id:'notes',icon:FileText,label:'Smart Notes',sub:'AI Enhanced',color:'#f97316',glow:'rgba(249,115,22,0.12)'},
  {id:'flashcards',icon:BookOpen,label:'Flashcards',sub:'Spaced Repetition',color:'#ec4899',glow:'rgba(236,72,153,0.12)'},
  {id:'research-agent',icon:Globe,label:'Research Agent',sub:'Real-time Web',color:'#14b8a6',glow:'rgba(20,184,166,0.12)'},
  {id:'topic-explainer',icon:FlaskConical,label:'Topic Explainer',sub:'4 Depth Levels',color:'#a78bfa',glow:'rgba(167,139,250,0.12)'},
  {id:'digital-twin',icon:Cpu,label:'Digital Twin',sub:'Learning Profile',color:'#00d4ff',glow:'rgba(0,212,255,0.12)'},
  {id:'predictive',icon:TrendingUp,label:'Predictive AI',sub:'Exam Forecast',color:'#ffd700',glow:'rgba(255,215,0,0.12)'},
  {id:'gamified-world',icon:Trophy,label:'Gamified World',sub:'XP & Battles',color:'#f59e0b',glow:'rgba(245,158,11,0.12)'},
  {id:'startup-lab',icon:Rocket,label:'Startup Lab',sub:'Idea→Pitch',color:'#ef4444',glow:'rgba(239,68,68,0.12)'},
  {id:'ai-interview/coding',icon:Code,label:'Coding Interview',sub:'LeetCode AI',color:'#22d3ee',glow:'rgba(34,211,238,0.12)'},
  {id:'resume',icon:FileText,label:'Resume Analyzer',sub:'ATS Score',color:'#84cc16',glow:'rgba(132,204,22,0.12)'},
  {id:'institution',icon:Users,label:'Institution OS',sub:'Teacher + Parent',color:'#8b5cf6',glow:'rgba(139,92,246,0.12)'},
  {id:'neural-mapping',icon:Layers,label:'Neural Mapping',sub:'Knowledge Graph',color:'#06b6d4',glow:'rgba(6,182,212,0.12)'},
  {id:'cybersecurity',icon:Shield,label:'Cybersecurity',sub:'AI Security',color:'#10b981',glow:'rgba(16,185,129,0.12)'},
  {id:'satellite',icon:Satellite,label:'Satellite Mode',sub:'2G/Offline',color:'#64748b',glow:'rgba(100,116,139,0.1)'},
  {id:'voice-solver',icon:Mic,label:'Voice Solver',sub:'Speak & Learn',color:'#f43f5e',glow:'rgba(244,63,94,0.12)'},
  {id:'bio-hacking',icon:FlaskConical,label:'Bio-Hacking',sub:'Peak Performance',color:'#4ade80',glow:'rgba(74,222,128,0.12)'},
  {id:'global-university',icon:Globe,label:'Global University',sub:'8 World Courses',color:'#38bdf8',glow:'rgba(56,189,248,0.12)'},
  {id:'exam',icon:BarChart3,label:'Exam System',sub:'Create & Monitor',color:'#e879f9',glow:'rgba(232,121,249,0.12)'},

{id:'ai-assistant',icon:Brain,label:'AI Assistant',sub:'24/7 Study Helper',color:'#06b6d4',glow:'rgba(6,182,212,0.12)'},

{id:'knowledge-swap',icon:Users,label:'Knowledge Swap',sub:'Share Notes & Resources',color:'#8b5cf6',glow:'rgba(139,92,246,0.12)'},
]

const RADAR_DATA=[
  {sub:'Math',A:82,full:100},{sub:'Physics',A:76,full:100},{sub:'Coding',A:91,full:100},
  {sub:'English',A:88,full:100},{sub:'Chemistry',A:65,full:100},{sub:'Biology',A:70,full:100},
]

export default function Dashboard(){
  const nav=useNavigate()
  const{user}=useAuth()
  const{xp,level,streak}=useGame()
  const{attention,cogLoad,weakTopics,quizHistory}=useLearn()
  const{persona}=useUI()
  const[now,setNow]=useState(new Date())
  const league=getLeague(xp)
  const lvl=getLevelXP(xp)

  useEffect(()=>{
    const t=setInterval(()=>setNow(new Date()),60000)
    return()=>clearInterval(t)
  },[])

  const hour=now.getHours()
  const greeting=hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening'
  const bio=hour>=6&&hour<=9||hour>=15&&hour<=17||hour>=20&&hour<=23

  const recentActivity=quizHistory.slice(0,3)

  return(
    <div style={{padding:'24px 28px',maxWidth:1400,margin:'0 auto'}}>
      {/* Hero Row */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:20,marginBottom:28,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:13,color:'#475569',marginBottom:4,fontFamily:'monospace'}}>
            {now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
          </div>
          <h1 style={{fontSize:28,fontWeight:700,color:'#e2e8f0',lineHeight:1.2}}>
            {greeting}, <span className="tB">{user?.name?.split(' ')[0]||'Scholar'}</span> 👋
          </h1>
          <p style={{color:'#64748b',fontSize:14,marginTop:4}}>
            {user?.field_of_study||'Your journey'} · {user?.career_goal||'Dream big'} 🚀
          </p>
        </div>

        {/* Live Stats Row */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {[
            {l:'Level',v:level,s:`${fmtXP(xp)} XP`,c:'#00d4ff'},
            {l:'League',v:league.emoji+' '+league.name,s:'Global Rank',c:league.color},
            {l:'Streak',v:`${streak}🔥`,s:'days',c:'#f97316'},
            {l:'Attention',v:`${attention}%`,s:attention>70?'Peak Zone':'Focus up',c:attention>70?'#00ff88':'#ffd700'},
          ].map(s=>(
            <div key={s.l} className="glass" style={{padding:'12px 16px',borderRadius:12,minWidth:90,textAlign:'center',borderColor:`${s.c}22`}}>
              <div style={{fontSize:11,color:'#475569',marginBottom:3,fontFamily:'monospace'}}>{s.l}</div>
              <div style={{fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:'#475569'}}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* XP Bar */}
      <div className="glass" style={{padding:'14px 20px',borderRadius:14,marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontSize:12,color:'#64748b',fontFamily:'monospace'}}>LEVEL {level} → {level+1}</span>
          <span style={{fontSize:12,color:'#00d4ff',fontFamily:'monospace'}}>{fmtXP(lvl.current)} / 500 XP</span>
        </div>
        <div style={{height:6,background:'rgba(0,212,255,0.08)',borderRadius:3,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${lvl.progress}%`,background:'linear-gradient(90deg,#7c3aed,#00d4ff)',borderRadius:3,transition:'width 1s ease',boxShadow:'0 0 10px rgba(0,212,255,0.4)'}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
          <span style={{fontSize:10,color:'#334155'}}>League: {league.emoji} {league.name}</span>
          <span style={{fontSize:10,color:'#334155'}}>{500-lvl.current} XP to level up</span>
        </div>
      </div>

      {/* Bio Window Banner */}
      {bio&&(
        <div style={{padding:'10px 18px',borderRadius:12,marginBottom:20,background:'rgba(0,255,136,0.06)',border:'1px solid rgba(0,255,136,0.15)',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:16}}>🧬</span>
          <div>
            <span style={{fontSize:13,fontWeight:600,color:'#00ff88'}}>Peak Bio Window Active</span>
            <span style={{fontSize:12,color:'#64748b',marginLeft:8}}>Your brain is in optimal learning state right now — start a study session!</span>
          </div>
          <button className="btn bGr" style={{marginLeft:'auto',padding:'6px 14px',fontSize:12}} onClick={()=>nav('/agi-mentor')}>Study Now →</button>
        </div>
      )}

      {/* Main Grid: Charts + Modules */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        {/* Performance Chart */}
        <div className="glass-d" style={{padding:20,borderRadius:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>Performance Trend</div>
              <div style={{fontSize:11,color:'#475569'}}>AI predicted vs actual score</div>
            </div>
            <span style={{fontSize:11,color:'#00ff88',fontFamily:'monospace'}}>+{PERF_DATA[PERF_DATA.length-1].actual - PERF_DATA[0].actual}% this year</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={PERF_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="month" tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false} domain={[50,100]}/>
              <Tooltip contentStyle={{background:'#0f172a',border:'1px solid rgba(0,212,255,0.2)',borderRadius:8,fontSize:11}}/>
              <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={2} dot={{fill:'#00d4ff',r:3}}/>
              <Line type="monotone" dataKey="predicted" stroke="#7c3aed" strokeWidth={2} strokeDasharray="4 2" dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Radar */}
        <div className="glass-d" style={{padding:20,borderRadius:16}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>Subject Mastery</div>
            <div style={{fontSize:11,color:'#475569'}}>Your Digital Twin profile</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.06)"/>
              <PolarAngleAxis dataKey="sub" tick={{fill:'#475569',fontSize:10}}/>
              <Radar name="You" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.12}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:24}}>
        {[
          {icon:Brain,l:'Ask AI',s:'Get instant answers',c:'#00d4ff',path:'/agi-mentor'},
          {icon:Zap,l:'Quick Quiz',s:'Test yourself now',c:'#ffd700',path:'/quiz'},
          {icon:Mic,l:'Voice Doubt',s:'Speak to solve',c:'#f43f5e',path:'/voice-solver'},
          {icon:Target,l:'Mock Interview',s:'Practice now',c:'#7c3aed',path:'/ai-interview'},
        ].map(a=>(
          <button key={a.l} onClick={()=>nav(a.path)} className="glass" style={{padding:'14px',borderRadius:12,border:`1px solid ${a.c}22`,background:`${a.c}06`,cursor:'pointer',textAlign:'left',transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=`${a.c}44`;e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=`${a.c}22`;e.currentTarget.style.transform='translateY(0)'}}>
            <a.icon size={18} style={{color:a.c,marginBottom:6}}/>
            <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>{a.l}</div>
            <div style={{fontSize:11,color:'#475569'}}>{a.s}</div>
          </button>
        ))}
      </div>

      {/* All Modules Grid */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <h2 style={{fontSize:16,fontWeight:700,color:'#e2e8f0'}}>Mission Control</h2>
            <p style={{fontSize:12,color:'#475569',marginTop:2}}>22 AI-powered modules</p>
          </div>
          {weakTopics.length>0&&(
            <div style={{fontSize:12,color:'#ffd700',padding:'4px 10px',background:'rgba(255,215,0,0.08)',borderRadius:8,border:'1px solid rgba(255,215,0,0.15)'}}>
              ⚠️ Weak: {weakTopics.slice(0,2).join(', ')}
            </div>
          )}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:10}}>
          {MODULES.map(m=>(
            <button key={m.id} onClick={()=>nav('/'+m.id)} className="glass mod-card" style={{padding:'16px 14px',borderRadius:14,border:`1px solid ${m.color}1a`,cursor:'pointer',textAlign:'left',transition:'all .25s',background:`${m.color}04`,position:'relative',overflow:'hidden'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${m.color}44`;e.currentTarget.style.background=m.glow;e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 24px ${m.color}20`}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${m.color}1a`;e.currentTarget.style.background=`${m.color}04`;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
              {m.hot&&<span style={{position:'absolute',top:6,right:6,fontSize:9,background:'rgba(239,68,68,0.15)',color:'#ef4444',padding:'1px 5px',borderRadius:4,fontWeight:700,letterSpacing:'0.05em'}}>HOT</span>}
              <m.icon size={20} style={{color:m.color,marginBottom:8}}/>
              <div style={{fontSize:12,fontWeight:700,color:'#e2e8f0',marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:10,color:'#475569'}}>{m.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length>0&&(
        <div className="glass-d" style={{padding:20,borderRadius:16}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0',marginBottom:14}}>Recent Activity</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {recentActivity.map((q,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                <Zap size={14} style={{color:'#ffd700'}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#e2e8f0'}}>{q.topic||'Quiz'}</div>
                  <div style={{fontSize:11,color:'#475569'}}>{q.score}/{q.total} correct · {q.xp||'+50'} XP</div>
                </div>
                <span style={{fontSize:11,color:'#334155'}}>{q.date||'Today'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

