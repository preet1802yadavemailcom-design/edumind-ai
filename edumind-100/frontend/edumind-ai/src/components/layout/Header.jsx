import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useUI,useAuth,useLearn} from '../../lib/store'
import {LANGUAGES,PERSONAS} from '../../lib/api'
import {Bell,Globe,Bot,ChevronDown,Eye,Activity} from 'lucide-react'

export default function Header(){
  const nav=useNavigate()
  const{lang,setLang,persona,setPersona,notifs,markAllRead}=useUI()
  const{user}=useAuth()
  const{attention,cogLoad}=useLearn()
  const[sN,setSN]=useState(false),[sL,setSL]=useState(false),[sP,setSP]=useState(false)
  const unread=notifs.filter(n=>!n.read).length
  const cp=PERSONAS.find(p=>p.id===persona)||PERSONAS[0]
  return(
    <header className="shrink-0 flex items-center gap-3 px-5 py-2.5 z-10 relative"
      style={{background:'rgba(3,7,16,0.87)',borderBottom:'1px solid rgba(0,212,255,0.08)',backdropFilter:'blur(24px)'}}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{background:'rgba(0,255,136,0.07)',border:'1px solid rgba(0,255,136,0.14)'}}>
          <Eye size={12} style={{color:'#00ff88'}}/><span className="font-mono text-xs" style={{color:'#00ff88'}}>ATT {attention}%</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{background:'rgba(0,212,255,0.07)',border:'1px solid rgba(0,212,255,0.14)'}}>
          <Activity size={12} style={{color:'#00d4ff'}}/><span className="font-mono text-xs" style={{color:'#00d4ff'}}>CL {cogLoad}%</span>
        </div>
      </div>
      <div className="flex-1"/>
      <div className="relative">
        <button onClick={()=>{setSL(!sL);setSP(false);setSN(false)}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{background:'rgba(0,212,255,0.07)',color:'#00d4ff',border:'1px solid rgba(0,212,255,0.14)'}}>
          <Globe size={13}/><span className="font-mono hidden md:inline">{lang}</span><ChevronDown size={11}/>
        </button>
        {sL&&(<div className="absolute right-0 top-full mt-1.5 glass-d rounded-xl overflow-hidden z-50 w-40 py-1">
          {LANGUAGES.map(l=>(<button key={l} onClick={()=>{setLang(l);setSL(false)}} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5" style={{color:l===lang?'#00d4ff':'#94a3b8'}}>{l}</button>))}
        </div>)}
      </div>
      <div className="relative">
        <button onClick={()=>{setSP(!sP);setSL(false);setSN(false)}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{background:'rgba(124,58,237,0.08)',color:'#a78bfa',border:'1px solid rgba(124,58,237,0.16)'}}>
          <Bot size={13}/><span className="font-mono hidden md:inline">{cp.emoji} {cp.label.split(' ')[0]}</span><ChevronDown size={11}/>
        </button>
        {sP&&(<div className="absolute right-0 top-full mt-1.5 glass-d rounded-xl overflow-hidden z-50 w-52 py-1">
          {PERSONAS.map(p=>(<button key={p.id} onClick={()=>{setPersona(p.id);setSP(false)}} className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/5" style={{color:p.id===persona?'#a78bfa':'#64748b'}}>
            <div className="font-semibold text-xs">{p.emoji} {p.label}</div>
            <div style={{color:'#374151',fontSize:10}}>{p.desc}</div>
          </button>))}
        </div>)}
      </div>
      <div className="relative">
        <button onClick={()=>{setSN(!sN);setSL(false);setSP(false)}} className="relative p-2 rounded-lg hover:bg-white/5">
          <Bell size={17} style={{color:'#94a3b8'}}/>
          {unread>0&&<div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{background:'#ff3366',color:'white',fontSize:9}}>{unread}</div>}
        </button>
        {sN&&(<div className="absolute right-0 top-full mt-1.5 glass-d rounded-xl z-50 w-80 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5" style={{borderBottom:'1px solid rgba(0,212,255,0.08)'}}>
            <span className="text-sm font-semibold" style={{color:'#e2e8f0'}}>Notifications</span>
            <button onClick={markAllRead} className="text-xs" style={{color:'#00d4ff'}}>Mark all read</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.map(n=>(<div key={n.id} className="px-4 py-3 hover:bg-white/3 transition-colors" style={{borderBottom:'1px solid rgba(255,255,255,0.025)',opacity:n.read?.5:1}}>
              <div className="text-xs" style={{color:'#e2e8f0'}}>{n.msg}</div>
              <div className="text-xs mt-0.5" style={{color:'#475569'}}>{n.time}</div>
            </div>))}
          </div>
        </div>)}
      </div>
      <button onClick={()=>nav('/profile')} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'white'}}>
          {(user?.name||'U')[0].toUpperCase()}
        </div>
        <span className="text-xs hidden md:block" style={{color:'#94a3b8'}}>{user?.name||'Student'}</span>
      </button>
    </header>
  )
}