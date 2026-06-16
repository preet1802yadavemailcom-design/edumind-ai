import {useState,useEffect} from 'react'
import {Outlet,useNavigate,useLocation} from 'react-router-dom'
import {useAuth,useGame,useUI} from '../../lib/store'
import {getLeague,getLevelXP,fmtXP,PERSONAS,checkHealth} from '../../lib/api'
import {Brain,Menu,X,Bell,Settings,LogOut,ChevronDown,Wifi,WifiOff,Zap,BookOpen,Target,Calendar,FileText,Globe,FlaskConical,Trophy,Rocket,Code,Users,Shield,Satellite,Cpu,Layers,BarChart3,TrendingUp,Mic,Home,LayoutDashboard,Search,Star} from 'lucide-react'

const NAV=[
  {section:'CORE AI',items:[
    {path:'/dashboard',icon:LayoutDashboard,l:'Dashboard',c:'#00d4ff'},
    {path:'/agi-mentor',icon:Brain,l:'AGI Mentor',c:'#00d4ff',hot:true},
    {path:'/voice-solver',icon:Mic,l:'Voice Solver',c:'#f43f5e'},
    {path:'/topic-explainer',icon:FlaskConical,l:'Topic Explainer',c:'#a78bfa'},
    {path:'/research-agent',icon:Globe,l:'Research Agent',c:'#14b8a6'},
  ]},
  {section:'LEARN & TEST',items:[
    {path:'/quiz',icon:Zap,l:'Quiz Generator',c:'#ffd700'},
    {path:'/flashcards',icon:BookOpen,l:'Flashcards',c:'#ec4899'},
    {path:'/notes',icon:FileText,l:'Smart Notes',c:'#f97316'},
    {path:'/schedule',icon:Calendar,l:'Study Schedule',c:'#00ff88'},
    {path:'/adaptive-recap',icon:Target,l:'Adaptive Recap',c:'#7c3aed'},
  ]},
  {section:'CAREER PREP',items:[
    {path:'/ai-interview',icon:Target,l:'Interview Prep',c:'#7c3aed'},
    {path:'/ai-interview/coding',icon:Code,l:'Coding Interview',c:'#22d3ee'},
    {path:'/resume',icon:FileText,l:'Resume Analyzer',c:'#84cc16'},
    {path:'/startup-lab',icon:Rocket,l:'Startup Lab',c:'#ef4444'},
  ]},
  {section:'ANALYTICS',items:[
    {path:'/digital-twin',icon:Cpu,l:'Digital Twin',c:'#00d4ff'},
    {path:'/predictive',icon:TrendingUp,l:'Predictive AI',c:'#ffd700'},
    {path:'/neural-mapping',icon:Layers,l:'Neural Mapping',c:'#06b6d4'},
  ]},
  {section:'GAMIFICATION',items:[
    {path:'/gamified-world',icon:Trophy,l:'Gamified World',c:'#f59e0b'},
    {path:'/leaderboard',icon:Star,l:'Leaderboard',c:'#ffd700'},
  ]},
  {section:'INSTITUTION',items:[
    {path:'/institution',icon:Users,l:'Institution OS',c:'#8b5cf6'},
    {path:'/exam',icon:BarChart3,l:'Exam System',c:'#e879f9'},
    {path:'/global-university',icon:Globe,l:'Global University',c:'#38bdf8'},
  ]},
  {section:'ADVANCED',items:[
    {path:'/cybersecurity',icon:Shield,l:'Cybersecurity',c:'#10b981'},
    {path:'/satellite',icon:Satellite,l:'Satellite Mode',c:'#64748b'},
    {path:'/bio-hacking',icon:FlaskConical,l:'Bio-Hacking',c:'#4ade80'},
  ]},
]

export default function Layout(){
  const[collapsed,setCollapsed]=useState(false)
  const[online,setOnline]=useState(true)
  const nav=useNavigate()
  const loc=useLocation()
  const{user,logout}=useAuth()
  const{xp,level,streak}=useGame()
  const{persona,setPersona,notifs}=useUI()
  const league=getLeague(xp)
  const lvl=getLevelXP(xp)
  const unread=notifs.filter(n=>!n.read).length

  useEffect(()=>{
    checkHealth().then(h=>setOnline(!!h)).catch(()=>setOnline(false))
    const t=setInterval(()=>checkHealth().then(h=>setOnline(!!h)).catch(()=>setOnline(false)),30000)
    return()=>clearInterval(t)
  },[])

  function doLogout(){logout();nav('/auth')}

  return(
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#030712'}}>
      {/* SIDEBAR */}
      <aside style={{width:collapsed?60:230,flexShrink:0,background:'rgba(5,13,28,0.98)',borderRight:'1px solid rgba(255,255,255,0.05)',display:'flex',flexDirection:'column',transition:'width .25s ease',overflow:'hidden'}}>
        {/* Logo */}
        <div style={{padding:collapsed?'16px 0':'16px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(255,255,255,0.04)',justifyContent:collapsed?'center':'flex-start',flexShrink:0}}>
          <div style={{width:32,height:32,background:'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15))',border:'1px solid rgba(0,212,255,0.25)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Brain size={16} style={{color:'#00d4ff'}}/>
          </div>
          {!collapsed&&<div><div style={{fontSize:13,fontWeight:800,color:'#e2e8f0',letterSpacing:'-0.02em'}}>EduMind AI</div><div style={{fontSize:9,color:'#334155',fontFamily:'monospace'}}>WORLD NO.1</div></div>}
        </div>

        {/* User Card */}
        {!collapsed&&(
          <div style={{padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,0.04)',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#00d4ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>
                {(user?.name||'U')[0].toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name||'Scholar'}</div>
                <div style={{fontSize:10,color:'#475569',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.field_of_study||'Learning'}</div>
              </div>
              <span style={{fontSize:13}}>{league.emoji}</span>
            </div>
            {/* XP Mini Bar */}
            <div style={{height:3,background:'rgba(0,212,255,0.08)',borderRadius:2,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${lvl.progress}%`,background:'linear-gradient(90deg,#7c3aed,#00d4ff)',borderRadius:2}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
              <span style={{fontSize:9,color:'#334155',fontFamily:'monospace'}}>LVL {level}</span>
              <span style={{fontSize:9,color:'#334155',fontFamily:'monospace'}}>{fmtXP(xp)} XP</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{flex:1,overflowY:'auto',padding:'8px 6px',scrollbarWidth:'thin',scrollbarColor:'rgba(255,255,255,0.06) transparent'}}>
          {NAV.map(sec=>(
            <div key={sec.section} style={{marginBottom:4}}>
              {!collapsed&&<div style={{fontSize:9,color:'#334155',fontFamily:'monospace',letterSpacing:'0.1em',padding:'6px 8px 3px',fontWeight:600}}>{sec.section}</div>}
              {sec.items.map(item=>{
                const active=loc.pathname===item.path||(item.path!=='/dashboard'&&loc.pathname.startsWith(item.path))
                return(
                  <button key={item.path} onClick={()=>nav(item.path)} title={collapsed?item.l:''}
                    style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:collapsed?'9px 0':'8px 10px',borderRadius:8,border:'none',cursor:'pointer',transition:'all .15s',marginBottom:1,justifyContent:collapsed?'center':'flex-start',
                      background:active?`${item.c}14`:'transparent',
                      color:active?item.c:'#64748b'}}>
                    <item.icon size={15} style={{flexShrink:0}}/>
                    {!collapsed&&<span style={{fontSize:12,fontWeight:active?600:400,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.l}</span>}
                    {!collapsed&&item.hot&&<span style={{marginLeft:'auto',fontSize:8,background:'rgba(239,68,68,0.15)',color:'#ef4444',padding:'1px 4px',borderRadius:3,fontWeight:700}}>HOT</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{padding:'8px 6px',borderTop:'1px solid rgba(255,255,255,0.04)',flexShrink:0}}>
          {!collapsed&&(
            <div style={{padding:'6px 10px',marginBottom:4,display:'flex',alignItems:'center',gap:6}}>
              {online
                ?<><Wifi size={11} style={{color:'#00ff88'}}/><span style={{fontSize:10,color:'#00ff88',fontFamily:'monospace'}}>Backend Online</span></>
                :<><WifiOff size={11} style={{color:'#ef4444'}}/><span style={{fontSize:10,color:'#ef4444',fontFamily:'monospace'}}>Backend Offline</span></>}
            </div>
          )}
          <button onClick={doLogout} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:collapsed?'9px 0':'8px 10px',borderRadius:8,border:'none',cursor:'pointer',background:'transparent',color:'#475569',justifyContent:collapsed?'center':'flex-start',transition:'all .15s'}}
            onMouseEnter={e=>e.currentTarget.style.color='#ef4444'}
            onMouseLeave={e=>e.currentTarget.style.color='#475569'}>
            <LogOut size={14} style={{flexShrink:0}}/>
            {!collapsed&&<span style={{fontSize:12}}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header */}
        <header style={{height:52,borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',padding:'0 20px',gap:12,flexShrink:0,background:'rgba(3,7,18,0.9)'}}>
          <button onClick={()=>setCollapsed(!collapsed)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',padding:6,borderRadius:6,display:'flex',transition:'color .15s'}}
            onMouseEnter={e=>e.currentTarget.style.color='#00d4ff'}
            onMouseLeave={e=>e.currentTarget.style.color='#475569'}>
            {collapsed?<Menu size={16}/>:<X size={16}/>}
          </button>

          <div style={{flex:1,display:'flex',alignItems:'center',gap:8,maxWidth:280}}>
            <Search size={13} style={{color:'#334155'}}/>
            <input placeholder="Search modules, topics..." style={{background:'transparent',border:'none',outline:'none',color:'#94a3b8',fontSize:12,width:'100%'}} onClick={()=>nav('/agi-mentor')}/>
          </div>

          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
            {/* Streak */}
            <div style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.15)',borderRadius:8}}>
              <span style={{fontSize:13}}>🔥</span>
              <span style={{fontSize:12,fontWeight:600,color:'#f97316'}}>{streak} days</span>
            </div>

            {/* Persona picker */}
            <select value={persona} onChange={e=>setPersona(e.target.value)}
              style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#94a3b8',fontSize:11,padding:'4px 8px',cursor:'pointer',outline:'none'}}>
              {PERSONAS.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
            </select>

            {/* Notifications */}
            <button style={{position:'relative',background:'none',border:'none',color:'#475569',cursor:'pointer',padding:6}}>
              <Bell size={15}/>
              {unread>0&&<span style={{position:'absolute',top:2,right:2,width:8,height:8,background:'#ef4444',borderRadius:'50%',fontSize:0}}/>}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{flex:1,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'rgba(255,255,255,0.06) transparent'}}>
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
