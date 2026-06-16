import {useState} from 'react'
import {useParams,useNavigate} from 'react-router-dom'
import {useGame} from '../lib/store'
import {interviewGenerateAPI,interviewEvaluateAPI} from '../lib/api'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {Target,Code,Users,Loader,ChevronRight,RotateCcw,Send,Star} from 'lucide-react'

const TYPES=[
  {id:'hr',icon:Users,l:'HR Interview',sub:'Behavioral questions',c:'#7c3aed'},
  {id:'technical',icon:Target,l:'Technical',sub:'Domain knowledge',c:'#00d4ff'},
  {id:'coding',icon:Code,l:'Coding',sub:'LeetCode style',c:'#22d3ee'},
]
const DOMAINS=['Web Development','Data Science','Machine Learning','System Design','DSA','DevOps','Android','iOS','Blockchain','Cybersecurity']

export default function InterviewPage(){
  const{type:paramType}=useParams()
  const nav=useNavigate()
  const{addXP}=useGame()
  const[type,setType]=useState(paramType||'hr')
  const[domain,setDomain]=useState('Web Development')
  const[role,setRole]=useState('Software Engineer')
  const[question,setQuestion]=useState('')
  const[answer,setAnswer]=useState('')
  const[feedback,setFeedback]=useState('')
  const[loading,setLoading]=useState(false)
  const[evalLoading,setEvalLoading]=useState(false)
  const[phase,setPhase]=useState('setup')
  const[score,setScore]=useState(null)
  const[history,setHistory]=useState([])

  async function generate(){
    setLoading(true);setQuestion('');setFeedback('');setAnswer('');setScore(null)
    try{
      const r=await interviewGenerateAPI(type,domain,role)
      setQuestion(r)
      setPhase('answer')
      toast.success('Question ready! Think carefully 🎯')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  async function evaluate(){
    if(!answer.trim()||answer.length<20) return toast.error('Write a proper answer (min 20 chars)')
    setEvalLoading(true)
    try{
      const r=await interviewEvaluateAPI(question,answer,type)
      setFeedback(r)
      // Extract score from response
      const m=r.match(/score[:\s]*(\d+)/i)||r.match(/(\d+)\/10/)
      const s=m?Math.min(10,parseInt(m[1])):7
      setScore(s)
      const xp=s*10+10
      addXP(xp,'interview_evaluated')
      setHistory(h=>[{q:question,a:answer,score:s,type},,...h].slice(0,10))
      toast.success(`Evaluated! Score: ${s}/10 · +${xp} XP 🏆`)
      setPhase('feedback')
    }catch(err){toast.error(err.message)}
    finally{setEvalLoading(false)}
  }

  const curType=TYPES.find(t=>t.id===type)||TYPES[0]

  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(124,58,237,0.2)'}}><Target size={18} style={{color:'#7c3aed'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Interview Prep</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>AI-powered mock interviews</p></div>
        {history.length>0&&<div style={{marginLeft:'auto',fontSize:11,color:'#475569'}}>Sessions: {history.length}</div>}
      </div>

      {/* Type selector */}
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        {TYPES.map(t=>(
          <button key={t.id} onClick={()=>{setType(t.id);setPhase('setup');setQuestion('');setFeedback('')}}
            style={{flex:1,padding:'14px',borderRadius:12,border:'1px solid',cursor:'pointer',transition:'all .2s',textAlign:'center',
              borderColor:type===t.id?`${t.c}40`:'rgba(255,255,255,0.06)',
              background:type===t.id?`${t.c}10`:'rgba(255,255,255,0.02)'}}>
            <t.icon size={18} style={{color:type===t.id?t.c:'#475569',margin:'0 auto 6px'}}/>
            <div style={{fontSize:12,fontWeight:700,color:type===t.id?t.c:'#e2e8f0'}}>{t.l}</div>
            <div style={{fontSize:10,color:'#475569'}}>{t.sub}</div>
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:20}}>
        {/* Config Panel */}
        <div>
          <div className="glass-d" style={{padding:20,borderRadius:14}}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>ROLE</label>
              <input className="inp" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Software Engineer"/>
            </div>
            {(type==='technical'||type==='coding')&&(
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>DOMAIN</label>
                <div style={{display:'flex',flexDirection:'column',gap:5,maxHeight:200,overflowY:'auto'}}>
                  {DOMAINS.map(d=>(
                    <button key={d} onClick={()=>setDomain(d)}
                      style={{padding:'7px 10px',borderRadius:7,fontSize:11,border:'1px solid',cursor:'pointer',textAlign:'left',
                        borderColor:domain===d?'rgba(0,212,255,0.3)':'rgba(255,255,255,0.05)',
                        background:domain===d?'rgba(0,212,255,0.08)':'transparent',
                        color:domain===d?'#00d4ff':'#94a3b8'}}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button className="btn bPr" style={{justifyContent:'center',width:'100%'}} onClick={generate} disabled={loading}>
              {loading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Target size={13}/>}
              {loading?'Generating...':'Get Question'}
            </button>
          </div>

          {/* History */}
          {history.length>0&&(
            <div style={{marginTop:14}}>
              <div style={{fontSize:11,color:'#64748b',fontFamily:'monospace',marginBottom:8}}>RECENT SCORES</div>
              {history.slice(0,5).map((h,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:8,background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.05)',marginBottom:5}}>
                  <span style={{fontSize:10,color:'#475569',textTransform:'capitalize'}}>{h.type}</span>
                  <div style={{flex:1,height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${h.score*10}%`,background:h.score>=7?'#00ff88':h.score>=5?'#ffd700':'#ef4444',borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:h.score>=7?'#00ff88':h.score>=5?'#ffd700':'#ef4444'}}>{h.score}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Panel */}
        <div>
          {!question&&!loading&&(
            <div className="glass-d" style={{padding:40,borderRadius:14,textAlign:'center',minHeight:300,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <curType.icon size={36} style={{color:curType.c,marginBottom:12}}/>
              <h3 style={{fontSize:16,fontWeight:600,color:'#e2e8f0',marginBottom:6}}>{curType.l} Practice</h3>
              <p style={{fontSize:12,color:'#475569',marginBottom:20}}>Configure your preferences and generate a question</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
                {type==='hr'
                  ?['Tell me about yourself','Why this role?','Biggest weakness','Team conflict','Achievement'].map(t=>(
                    <span key={t} className="tag tgP">{t}</span>
                  ))
                  :['Arrays','Recursion','System Design','OOP','SQL'].map(t=>(
                    <span key={t} className="tag tgB">{t}</span>
                  ))}
              </div>
            </div>
          )}

          {loading&&(
            <div className="glass-d" style={{padding:40,borderRadius:14,textAlign:'center',minHeight:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                <Loader size={24} style={{color:curType.c,animation:'spin 1s linear infinite'}}/>
                <p style={{fontSize:13,color:'#475569'}}>Generating {curType.l} question...</p>
              </div>
            </div>
          )}

          {question&&phase==='answer'&&(
            <div className="glass-d" style={{padding:24,borderRadius:14}}>
              <div style={{padding:'14px 16px',background:'rgba(124,58,237,0.06)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:10,marginBottom:20}}>
                <div style={{fontSize:11,color:'#7c3aed',fontFamily:'monospace',marginBottom:6}}>QUESTION</div>
                <div className="prose-ai"><ReactMarkdown>{question}</ReactMarkdown></div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>YOUR ANSWER</label>
                <textarea className="inp" value={answer} onChange={e=>setAnswer(e.target.value)}
                  placeholder={type==='hr'?"Use STAR method: Situation, Task, Action, Result...":type==='coding'?"Write your code and explain your approach...":"Explain your approach clearly..."}
                  style={{minHeight:160,fontSize:13}}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn bGh" onClick={generate}><RotateCcw size={12}/> New Question</button>
                <button className="btn bPr" style={{flex:1,justifyContent:'center'}} onClick={evaluate} disabled={evalLoading||!answer.trim()}>
                  {evalLoading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Send size={13}/>}
                  {evalLoading?'Evaluating...':'Get AI Feedback'}
                </button>
              </div>
            </div>
          )}

          {feedback&&phase==='feedback'&&(
            <div className="glass-d" style={{padding:24,borderRadius:14}}>
              {score!==null&&(
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,padding:'12px 16px',background:'rgba(255,255,255,0.02)',borderRadius:10}}>
                  <div style={{textAlign:'center',minWidth:60}}>
                    <div style={{fontSize:28,fontWeight:800,color:score>=7?'#00ff88':score>=5?'#ffd700':'#ef4444'}}>{score}</div>
                    <div style={{fontSize:10,color:'#475569'}}>/10 score</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${score*10}%`,background:score>=7?'#00ff88':score>=5?'#ffd700':'#ef4444',borderRadius:3}}/>
                    </div>
                    <div style={{fontSize:11,color:'#475569',marginTop:4}}>{score>=8?'Excellent! Ready for real interviews':score>=6?'Good! Keep practicing':score>=4?'Needs improvement':'Focus on fundamentals'}</div>
                  </div>
                  <Star size={16} style={{color:'#ffd700'}}/>
                </div>
              )}
              <div className="prose-ai"><ReactMarkdown>{feedback}</ReactMarkdown></div>
              <div style={{display:'flex',gap:8,marginTop:16}}>
                <button className="btn bGh" onClick={()=>{setPhase('answer');setFeedback('')}}><ChevronRight size={12}/> Try Again</button>
                <button className="btn bPr" style={{flex:1,justifyContent:'center'}} onClick={generate}><RotateCcw size={12}/> Next Question</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
