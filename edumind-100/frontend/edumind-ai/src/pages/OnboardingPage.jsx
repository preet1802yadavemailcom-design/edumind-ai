import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth,useGame} from '../lib/store'
import {apiUpdateOnboarding,fireConfetti} from '../lib/api'
import toast from 'react-hot-toast'
import {Brain,BookOpen,Clock,Target,Rocket,ChevronRight,CheckCircle,Loader} from 'lucide-react'

const FIELDS=['Computer Science','Engineering','Medicine','Commerce','Arts','Physics','Chemistry','Biology','Mathematics','Law','Architecture','Other']
const STYLES=[{id:'visual',e:'👁️',l:'Visual',d:'Diagrams & videos'},{id:'auditory',e:'🎵',l:'Auditory',d:'Lectures & podcasts'},{id:'reading',e:'📚',l:'Reading',d:'Books & notes'},{id:'kinesthetic',e:'🛠️',l:'Hands-on',d:'Projects & practice'}]
const GOALS=[{id:'1h',l:'1 hour/day',d:'Casual'},{id:'2h',l:'2 hours/day',d:'Moderate'},{id:'3h',l:'3 hours/day',d:'Serious'},{id:'5h',l:'5+ hours/day',d:'Intense'}]
const CAREERS=['Software Engineer','Doctor','IAS/IPS Officer','Entrepreneur','Data Scientist','Product Manager','Researcher','CA/Finance','Teacher/Professor','Other']

export default function OnboardingPage(){
  const[step,setStep]=useState(0)
  const[field,setField]=useState('')
  const[style,setStyle]=useState('')
  const[goal,setGoal]=useState('')
  const[career,setCareer]=useState('')
  const[loading,setLoading]=useState(false)
  const nav=useNavigate()
  const{finishOnboarding,user}=useAuth()
  const{addXP}=useGame()

  const steps=[
    {title:`Welcome, ${user?.name?.split(' ')[0]||'Scholar'}! 👋`,sub:'Tell us about yourself to personalize your AI experience',icon:Brain},
    {title:'Field of Study',sub:'What are you studying?',icon:BookOpen},
    {title:'Learning Style',sub:'How do you learn best?',icon:Brain},
    {title:'Daily Goal',sub:'How much time can you dedicate?',icon:Clock},
    {title:'Career Ambition',sub:"What's your dream career?",icon:Target},
  ]

  async function finish(){
    if(!field||!style||!goal||!career) return toast.error('Please complete all steps')
    setLoading(true)
    try{
      const data=await apiUpdateOnboarding({field_of_study:field,learning_style:style,daily_goal:goal,career_goal:career})
      finishOnboarding(data.user)
      addXP(250,'onboarding_complete')
      fireConfetti()
      toast.success('Profile complete! +250 XP 🎉')
      nav('/dashboard')
    }catch(err){
      // Offline fallback — still proceed
      finishOnboarding({...user,field_of_study:field,learning_style:style,daily_goal:goal,career_goal:career})
      addXP(250,'onboarding_complete')
      fireConfetti()
      nav('/dashboard')
    }finally{setLoading(false)}
  }

  const pct=Math.round(((step)/5)*100)

  return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'#030712'}}>
      <div style={{width:'100%',maxWidth:520}}>
        {/* Progress */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:12,color:'#475569',fontFamily:'monospace'}}>SETUP {step}/5</span>
            <span style={{fontSize:12,color:'#00d4ff',fontFamily:'monospace'}}>{pct}%</span>
          </div>
          <div style={{height:3,background:'rgba(0,212,255,0.08)',borderRadius:2}}>
            <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#7c3aed,#00d4ff)',borderRadius:2,transition:'width .4s ease'}}/>
          </div>
          <div style={{display:'flex',gap:6,marginTop:8}}>
            {[0,1,2,3,4].map(i=>(
              <div key={i} style={{flex:1,height:2,borderRadius:1,background:i<step?'#00d4ff':i===step?'rgba(0,212,255,0.4)':'rgba(255,255,255,0.05)',transition:'background .3s'}}/>
            ))}
          </div>
        </div>

        <div className="glass-d" style={{padding:36,borderRadius:20}}>
          <div style={{textAlign:'center',marginBottom:28}}>
            {(() => { const S=steps[step]; return <><div style={{width:52,height:52,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><S.icon size={24} style={{color:'#00d4ff'}}/></div><h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',marginBottom:6}}>{S.title}</h2><p style={{fontSize:13,color:'#64748b'}}>{S.sub}</p></> })()}
          </div>

          {step===0&&(
            <div style={{textAlign:'center'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:8}}>
                {[['🤖','AI Mentor','Personalized to your style'],['🎯','Smart Quizzes','Adaptive difficulty'],['📅','Study Schedule','AI-generated plan'],['🏆','Gamification','XP, badges & leagues']].map(([em,t,s])=>(
                  <div key={t} style={{padding:'12px 14px',background:'rgba(0,212,255,0.04)',border:'0.5px solid rgba(0,212,255,0.1)',borderRadius:10,textAlign:'left'}}>
                    <div style={{fontSize:18,marginBottom:4}}>{em}</div>
                    <div style={{fontSize:12,fontWeight:600,color:'#e2e8f0'}}>{t}</div>
                    <div style={{fontSize:10,color:'#475569'}}>{s}</div>
                  </div>
                ))}
              </div>
              <button className="btn bPr bLg" style={{justifyContent:'center',width:'100%',marginTop:8}} onClick={()=>setStep(1)}>
                <Rocket size={15}/> Let's Set Up Your Profile
              </button>
            </div>
          )}

          {step===1&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {FIELDS.map(f=>(
                  <button key={f} onClick={()=>setField(f)}
                    style={{padding:'10px 8px',borderRadius:8,fontSize:11,fontWeight:600,border:'1px solid',cursor:'pointer',transition:'all .2s',textAlign:'center',
                      borderColor:field===f?'#00d4ff':'rgba(255,255,255,0.06)',
                      background:field===f?'rgba(0,212,255,0.1)':'rgba(255,255,255,0.02)',
                      color:field===f?'#00d4ff':'#94a3b8'}}>
                    {field===f&&<CheckCircle size={10} style={{display:'inline',marginRight:3}}/>}{f}
                  </button>
                ))}
              </div>
              <button className="btn bPr" style={{marginTop:20,justifyContent:'center',width:'100%'}} disabled={!field} onClick={()=>setStep(2)}>
                Continue <ChevronRight size={14}/>
              </button>
            </div>
          )}

          {step===2&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {STYLES.map(s=>(
                  <button key={s.id} onClick={()=>setStyle(s.id)}
                    style={{padding:'16px',borderRadius:12,border:'1px solid',cursor:'pointer',transition:'all .2s',textAlign:'center',
                      borderColor:style===s.id?'#00d4ff':'rgba(255,255,255,0.06)',
                      background:style===s.id?'rgba(0,212,255,0.08)':'rgba(255,255,255,0.02)'}}>
                    <div style={{fontSize:24,marginBottom:6}}>{s.e}</div>
                    <div style={{fontSize:13,fontWeight:600,color:style===s.id?'#00d4ff':'#e2e8f0'}}>{s.l}</div>
                    <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{s.d}</div>
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:8,marginTop:16}}>
                <button className="btn bGh" onClick={()=>setStep(1)}>Back</button>
                <button className="btn bPr" style={{flex:1,justifyContent:'center'}} disabled={!style} onClick={()=>setStep(3)}>Continue <ChevronRight size={14}/></button>
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {GOALS.map(g=>(
                  <button key={g.id} onClick={()=>setGoal(g.id)}
                    style={{padding:'14px 16px',borderRadius:10,border:'1px solid',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:12,textAlign:'left',
                      borderColor:goal===g.id?'#00d4ff':'rgba(255,255,255,0.06)',
                      background:goal===g.id?'rgba(0,212,255,0.08)':'rgba(255,255,255,0.02)'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600,color:goal===g.id?'#00d4ff':'#e2e8f0'}}>{g.l}</div>
                      <div style={{fontSize:11,color:'#64748b'}}>{g.d}</div>
                    </div>
                    {goal===g.id&&<CheckCircle size={16} style={{color:'#00d4ff'}}/>}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:8,marginTop:16}}>
                <button className="btn bGh" onClick={()=>setStep(2)}>Back</button>
                <button className="btn bPr" style={{flex:1,justifyContent:'center'}} disabled={!goal} onClick={()=>setStep(4)}>Continue <ChevronRight size={14}/></button>
              </div>
            </div>
          )}

          {step===4&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
                {CAREERS.map(c=>(
                  <button key={c} onClick={()=>setCareer(c)}
                    style={{padding:'11px 12px',borderRadius:9,fontSize:12,fontWeight:500,border:'1px solid',cursor:'pointer',transition:'all .2s',
                      borderColor:career===c?'#ffd700':'rgba(255,255,255,0.06)',
                      background:career===c?'rgba(255,215,0,0.08)':'rgba(255,255,255,0.02)',
                      color:career===c?'#ffd700':'#94a3b8'}}>
                    {career===c&&<CheckCircle size={10} style={{display:'inline',marginRight:4}}/>}{c}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:8,marginTop:20}}>
                <button className="btn bGh" onClick={()=>setStep(3)}>Back</button>
                <button className="btn bGo bLg" style={{flex:1,justifyContent:'center'}} disabled={!career||loading} onClick={finish}>
                  {loading?<Loader size={14} className="animate-spin"/>:<Rocket size={14}/>}
                  {loading?'Setting up...':'Launch EduMind! 🚀'}
                </button>
              </div>
            </div>
          )}
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'#334155',marginTop:12}}>+250 XP bonus for completing your profile</p>
      </div>
    </div>
  )
}
