import {NavLink} from 'react-router-dom'
import {useState} from 'react'
import {useGame,useUI,useAuth} from '../../lib/store'
import {fmtXP,getLevelXP,getLeague} from '../../lib/api'
import {Brain,Home,Cpu,BarChart3,Activity,Network,Globe,Bot,Video,Layers,BookMarked,Microscope,Rocket,Gamepad2,Target,Trophy,GraduationCap,Shuffle,Orbit,Heart,Sparkles,Satellite,Shield,Eye,Building2,ClipboardList,Lightbulb,Hash,Users,FileText,Search,Calendar,BookOpen,FlaskConical,Map,Volume2,Flame,ChevronDown,ChevronRight,LogOut,User,Code2,Zap} from 'lucide-react'

const SECS=[
  {t:'⚡ CORE INTELLIGENCE',items:[
    {to:'/',l:'Mission Control',i:Home},{to:'/digital-twin',l:'AI Digital Twin',i:Cpu},
    {to:'/predictive-intelligence',l:'Predictive Intel',i:BarChart3},{to:'/brain-adaptive',l:'Brain-Adaptive Engine',i:Brain},
    {to:'/cognitive-load',l:'Cognitive Load Engine',i:Activity},{to:'/neural-mapping',l:'Neural Knowledge Map',i:Network},
    {to:'/quantum-sync',l:'Quantum Neural Sync',i:Orbit},
  ]},
  {t:'🎓 LEARNING UNIVERSE',items:[
    {to:'/agi-mentor',l:'AGI Mentor',i:Bot},{to:'/ai-tutor',l:'AI Video Tutor',i:Video},
    {to:'/auto-course-creator',l:'Course Creator',i:Layers},{to:'/global-university',l:'Global University',i:Globe},
    {to:'/memory-optimization',l:'Memory Optimizer',i:BookMarked},{to:'/research-agent',l:'Research Agent',i:Microscope},
  ]},
  {t:'🛠️ POWER TOOLS',items:[
    {to:'/learn',l:'Topic Explainer',i:Lightbulb},{to:'/voice',l:'Voice Solver',i:Volume2},
    {to:'/quiz',l:'AI Quiz Generator',i:Hash},{to:'/quiz-room',l:'Quiz Rooms',i:Users},
    {to:'/diagram',l:'Diagram Maker',i:Map},{to:'/notes',l:'Smart Notes',i:FileText},
    {to:'/research',l:'Research Finder',i:Search},{to:'/schedule',l:'Study Schedule',i:Calendar},
    {to:'/past-paper',l:'Past Paper Solver',i:BookOpen},{to:'/knowledge-graph',l:'Knowledge Graph',i:Network},
    {to:'/formula-sheet',l:'Formula Sheet',i:FlaskConical},{to:'/textbook',l:'AI Textbook',i:BookOpen},
  ]},
  {t:'💼 CAREER & INNOVATION',items:[
    {to:'/ai-interview',l:'AI Interview Prep',i:GraduationCap},
    {to:'/startup-lab',l:'Startup Lab',i:Rocket},{to:'/knowledge-swap',l:'Knowledge Swaps',i:Shuffle},
    {to:'/ai-assistant',l:'AI Assistant',i:Bot},
  ]},
  {t:'🎮 GAMIFICATION',items:[
    {to:'/gamified-world',l:'Gamified World',i:Gamepad2},
    {to:'/weakness-recap',l:'Adaptive Learning',i:Target},{to:'/leaderboard',l:'Global Leaderboard',i:Trophy},
  ]},
  {t:'🏫 INSTITUTION',items:[
    {to:'/institution',l:'Institution Hub',i:Building2},{to:'/exam',l:'Exam System',i:ClipboardList},
    {to:'/attention-detection',l:'Attention Monitor',i:Eye},
  ]},
  {t:'🌐 FRONTIER TECH',items:[
    {to:'/metaverse-campus',l:'3D Metaverse Campus',i:Globe},{to:'/holographic-synthesis',l:'Holographic 4D',i:Sparkles},
    {to:'/bio-hacking',l:'Bio-Hacking & Wellness',i:Heart},{to:'/satellite-protocol',l:'Satellite Protocol',i:Satellite},
    {to:'/rural-mode',l:'Low-Bandwidth Mode',i:Globe},{to:'/cybersecurity',l:'Cybersecurity Shield',i:Shield},
    {to:'/ai-os-assistant',l:'AI OS Assistant',i:Cpu},{to:'/attention-detection',l:'Attention Detection',i:Eye},
  ]},
]

export default function Sidebar(){
  const{collapsed,toggleCollapse}=useUI()
  const{xp,streak}=useGame()
  const{logout,user}=useAuth()
  const[open,setOpen]=useState({'⚡ CORE INTELLIGENCE':true,'🎓 LEARNING UNIVERSE':true})
  const{level,progress}=getLevelXP(xp)
  const league=getLeague(xp)
  return(
    <aside className="relative z-20 flex flex-col shrink-0 transition-all duration-300"
      style={{width:collapsed?52:246,background:'rgba(3,7,16,0.97)',borderRight:'1px solid rgba(0,212,255,0.08)',backdropFilter:'blur(40px)'}}>
      <div className="flex items-center gap-2.5 px-3 py-4 shrink-0" style={{borderBottom:'1px solid rgba(0,212,255,0.07)'}}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 gB" style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)'}}>
          <Brain size={17} color="white"/>
        </div>
        {!collapsed&&<div className="flex-1 min-w-0"><div className="font-display text-sm font-bold tB truncate">EduMind AI</div>
          <div className="text-xs truncate" style={{color:'rgba(148,163,184,.45)',fontSize:10}}>Student OS v2.0</div></div>}
        <button onClick={toggleCollapse} className="p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0" style={{color:'#374151'}}>
          {collapsed?<ChevronRight size={13}/>:<ChevronDown size={13} style={{transform:'rotate(-90deg)'}}/>}
        </button>
      </div>
      {!collapsed&&(
        <div className="px-3 py-2.5 shrink-0" style={{borderBottom:'1px solid rgba(0,212,255,0.07)'}}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-mono" style={{color:league.color}}>Lv.{level}·{league.name}</span>
            <span className="font-mono" style={{color:'#ffd700'}}>{fmtXP(xp)} XP</span>
          </div>
          <div className="xpT"><div className="xpF" style={{width:`${progress}%`}}/></div>
          <div className="flex items-center gap-1 mt-1.5"><Flame size={10} style={{color:'#ff9900'}}/><span className="text-xs" style={{color:'#ff9900'}}>{streak}-day streak</span></div>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-1.5 py-2 space-y-0.5" style={{scrollbarWidth:'none'}}>
        {SECS.map(sec=>(
          <div key={sec.t}>
            {!collapsed&&(
              <button onClick={()=>setOpen(o=>({...o,[sec.t]:!o[sec.t]}))}
                className="nSec w-full text-left flex items-center justify-between hover:opacity-60 transition-opacity">
                <span>{sec.t}</span>
                <ChevronDown size={9} style={{transform:open[sec.t]?'rotate(0)':'rotate(-90deg)',transition:'transform .2s'}}/>
              </button>
            )}
            {(collapsed||open[sec.t]!==false)&&sec.items.map(it=>(
              <NavLink key={it.to} to={it.to} end={it.to==='/'} className={({isActive})=>`nv ${isActive?'active':''}`} title={collapsed?it.l:undefined}>
                <it.i size={14} className="shrink-0"/>
                {!collapsed&&<span className="truncate text-xs">{it.l}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-1.5 pb-3 space-y-0.5 shrink-0" style={{borderTop:'1px solid rgba(0,212,255,0.07)',paddingTop:8}}>
        <NavLink to="/profile" className={({isActive})=>`nv ${isActive?'active':''}`}>
          <User size={14} className="shrink-0"/>
          {!collapsed&&<span className="text-xs truncate">{user?.name||'Profile'}</span>}
        </NavLink>
        <button onClick={logout} className="nv w-full" style={{color:'#ff3366'}}>
          <LogOut size={14} className="shrink-0"/>
          {!collapsed&&<span className="text-xs">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
