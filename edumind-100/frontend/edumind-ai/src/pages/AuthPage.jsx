import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth,useGame} from '../lib/store'
import {apiLogin,apiRegister,fireConfetti} from '../lib/api'
import toast from 'react-hot-toast'
import {Brain,Zap,Eye,EyeOff,Loader,Lock,Mail,User,Sparkles} from 'lucide-react'

export default function AuthPage(){
  const[tab,setTab]=useState('login')
  const[name,setName]=useState('')
  const[email,setEmail]=useState('')
  const[pass,setPass]=useState('')
  const[show,setShow]=useState(false)
  const[loading,setLoading]=useState(false)
  const nav=useNavigate()
  const{setSession}=useAuth()
  const{syncFromServer}=useGame()

  async function submit(e){
    e.preventDefault()
    if(!email||!pass) return toast.error('Fill all fields')
    if(tab==='register'&&!name) return toast.error('Name required')
    if(pass.length<6) return toast.error('Password min 6 characters')
    setLoading(true)
    try{
      const data=tab==='login'
        ? await apiLogin(email,pass)
        : await apiRegister(name,email,pass)
      setSession(data.user,data.token)
      syncFromServer(data.user)
      fireConfetti()
      toast.success(tab==='login'?`Welcome back, ${data.user.name}! 🚀`:`Welcome to EduMind, ${data.user.name}! 🎉`)
      nav(data.user.field_of_study?'/dashboard':'/onboarding')
    }catch(err){
      toast.error(err.message)
    }finally{setLoading(false)}
  }

  return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'linear-gradient(135deg,#030712 0%,#050d1c 50%,#030712 100%)'}}>
      {/* Background glow */}
      <div style={{position:'fixed',top:'20%',left:'10%',width:400,height:400,background:'radial-gradient(circle,rgba(0,212,255,0.04) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'fixed',bottom:'20%',right:'10%',width:400,height:400,background:'radial-gradient(circle,rgba(124,58,237,0.04) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <div style={{width:'100%',maxWidth:420}}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div style={{width:52,height:52,background:'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15))',border:'1px solid rgba(0,212,255,0.3)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Brain size={26} style={{color:'#00d4ff'}}/>
            </div>
            <div className="text-left">
              <div className="font-display text-2xl font-black tB">EduMind AI</div>
              <div style={{fontSize:11,color:'#475569',fontFamily:'monospace',letterSpacing:'0.1em'}}>WORLD NO.1 STUDENT OS</div>
            </div>
          </div>
          <p style={{color:'#64748b',fontSize:13}}>22 AI Modules · 6 Languages · Your personal AI tutor</p>
        </div>

        {/* Card */}
        <div className="glass-d" style={{padding:32,borderRadius:20}}>
          {/* Tabs */}
          <div style={{display:'flex',gap:8,marginBottom:28,padding:4,background:'rgba(255,255,255,0.03)',borderRadius:12}}>
            {['login','register'].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{flex:1,padding:'9px 16px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',transition:'all .2s',
                  background:tab===t?'rgba(0,212,255,0.12)':'transparent',
                  color:tab===t?'#00d4ff':'#64748b',
                  boxShadow:tab===t?'0 0 12px rgba(0,212,255,0.1)':'none'
                }}>
                {t==='login'?'Sign In':'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
            {tab==='register'&&(
              <div style={{position:'relative'}}>
                <User size={15} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#475569'}}/>
                <input className="inp" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)} style={{paddingLeft:38}}/>
              </div>
            )}
            <div style={{position:'relative'}}>
              <Mail size={15} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#475569'}}/>
              <input className="inp" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={{paddingLeft:38}}/>
            </div>
            <div style={{position:'relative'}}>
              <Lock size={15} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#475569'}}/>
              <input className="inp" type={show?'text':'password'} placeholder="Password (min 6 chars)" value={pass} onChange={e=>setPass(e.target.value)} style={{paddingLeft:38,paddingRight:44}}/>
              <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#475569',cursor:'pointer'}}>
                {show?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>

            <button type="submit" className="btn bPr bLg" disabled={loading} style={{justifyContent:'center',marginTop:4}}>
              {loading?<Loader size={15} className="animate-spin"/>:<Zap size={15}/>}
              {loading?'Processing...':(tab==='login'?'Launch EduMind':'Begin Journey')}
            </button>
          </form>

          {/* Features preview */}
          <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <div style={{fontSize:11,color:'#475569',textAlign:'center',marginBottom:12,letterSpacing:'0.05em'}}>WHAT YOU GET FOR FREE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[['🤖','AGI Mentor','4 AI personas'],['⚡','Quiz Engine','Any topic instantly'],['🎯','Interview Prep','500+ questions'],['🔬','Research AI','Real-time search']].map(([em,t,s])=>(
                <div key={t} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'8px 10px',background:'rgba(255,255,255,0.02)',borderRadius:8,border:'0.5px solid rgba(255,255,255,0.05)'}}>
                  <span style={{fontSize:14}}>{em}</span>
                  <div><div style={{fontSize:11,fontWeight:600,color:'#e2e8f0'}}>{t}</div><div style={{fontSize:10,color:'#475569'}}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{textAlign:'center',fontSize:11,color:'#334155',marginTop:16}}>
          <Sparkles size={10} style={{display:'inline',marginRight:4,color:'#00d4ff'}}/>
          100% free · No credit card · Join 50,000+ students
        </p>
      </div>
    </div>
  )
}
