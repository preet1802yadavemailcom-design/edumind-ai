import {useState} from 'react'
import {useGame} from '../lib/store'
import {generateScheduleAPI} from '../lib/api'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {Calendar,Loader,Plus,X} from 'lucide-react'

export default function SchedulePage(){
  const{addXP}=useGame()
  const[exam,setExam]=useState('')
  const[days,setDays]=useState(30)
  const[hours,setHours]=useState(3)
  const[subjects,setSubjects]=useState([])
  const[subInput,setSubInput]=useState('')
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)

  async function generate(){
    if(!exam.trim()) return toast.error('Enter exam name!')
    setLoading(true)
    try{
      const r=await generateScheduleAPI(exam,days,hours,subjects)
      setResult(r)
      addXP(20,'schedule_generated')
      toast.success('Schedule generated! +20 XP 📅')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  function addSub(){
    if(subInput.trim()&&!subjects.includes(subInput.trim())){
      setSubjects(s=>[...s,subInput.trim()]);setSubInput('')
    }
  }

  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(0,255,136,0.1)',border:'1px solid rgba(0,255,136,0.2)'}}><Calendar size={18} style={{color:'#00ff88'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Study Schedule</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>AI-generated personalized study plan</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:20}}>
        <div>
          <div className="glass-d" style={{padding:24,borderRadius:16}}>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>EXAM / GOAL</label>
              <input className="inp" placeholder="e.g. JEE Advanced, GATE 2026, UPSC..." value={exam} onChange={e=>setExam(e.target.value)}/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>DAYS LEFT: {days}</label>
              <input type="range" min={7} max={365} value={days} onChange={e=>setDays(+e.target.value)} style={{width:'100%',accentColor:'#00ff88'}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#334155',marginTop:3}}>
                <span>1 week</span><span>1 year</span>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>HOURS/DAY: {hours}</label>
              <input type="range" min={1} max={12} value={hours} onChange={e=>setHours(+e.target.value)} style={{width:'100%',accentColor:'#00ff88'}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>SUBJECTS (OPTIONAL)</label>
              <div style={{display:'flex',gap:6,marginBottom:8}}>
                <input className="inp" placeholder="Add subject..." value={subInput} onChange={e=>setSubInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSub()} style={{flex:1}}/>
                <button className="btn bGr bSm" onClick={addSub}><Plus size={12}/></button>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {subjects.map(s=>(
                  <span key={s} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:6,background:'rgba(0,255,136,0.08)',border:'1px solid rgba(0,255,136,0.15)',fontSize:11,color:'#00ff88'}}>
                    {s}<button onClick={()=>setSubjects(ss=>ss.filter(x=>x!==s))} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',padding:0,display:'flex'}}><X size={10}/></button>
                  </span>
                ))}
              </div>
            </div>
            <button className="btn bGr bLg" style={{justifyContent:'center',width:'100%'}} onClick={generate} disabled={loading||!exam.trim()}>
              {loading?<Loader size={14} style={{animation:'spin 1s linear infinite'}}/>:<Calendar size={14}/>}
              {loading?'Generating...':'Generate Schedule'}
            </button>
          </div>
        </div>
        <div className="glass-d" style={{padding:24,borderRadius:16,minHeight:400}}>
          {result
            ?<div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div>
            :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,color:'#334155',gap:10}}>
              <Calendar size={32} style={{color:'#334155'}}/>
              <p style={{fontSize:13}}>Your personalized schedule will appear here</p>
            </div>}
        </div>
      </div>
    </div>
  )
}
