import {useState} from 'react'
import {useGame,useLearn} from '../lib/store'
import {generateQuizAPI,fireConfetti} from '../lib/api'
import toast from 'react-hot-toast'
import {Zap,CheckCircle,XCircle,Loader,RotateCcw,Trophy,ChevronRight,Target} from 'lucide-react'

const TOPICS=['Quantum Physics','Organic Chemistry','Calculus','Indian History','Data Structures','Economics','World Geography','Biology','Machine Learning','Constitution of India']
const DIFFS=['easy','medium','hard','expert']

export default function QuizPage(){
  const{addXP}=useGame()
  const{addQuizResult,addWeak}=useLearn()
  const[topic,setTopic]=useState('')
  const[diff,setDiff]=useState('medium')
  const[count,setCount]=useState(5)
  const[questions,setQuestions]=useState([])
  const[answers,setAnswers]=useState({})
  const[submitted,setSubmitted]=useState(false)
  const[loading,setLoading]=useState(false)
  const[phase,setPhase]=useState('setup') // setup | quiz | result

  async function generate(){
    if(!topic.trim()) return toast.error('Enter a topic first!')
    setLoading(true)
    setAnswers({})
    setSubmitted(false)
    try{
      const data=await generateQuizAPI(topic.trim(),diff,count)
      const qs=data.questions||[]
      if(!qs.length) throw new Error('No questions generated. Try a different topic.')
      setQuestions(qs)
      setPhase('quiz')
      toast.success(`${qs.length} questions ready! 🎯`)
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  function select(qid,opt){
    if(submitted) return
    setAnswers(a=>({...a,[qid]:opt}))
  }

  function submit(){
    if(Object.keys(answers).length<questions.length) return toast.error('Answer all questions first!')
    setSubmitted(true)
    const score=questions.filter(q=>answers[q.id]===q.correct).length
    const pct=Math.round((score/questions.length)*100)
    const xp=score*20+(diff==='hard'?20:diff==='expert'?40:0)
    addXP(xp,'quiz_complete')
    addQuizResult({topic,score,total:questions.length,difficulty:diff,xp,date:new Date().toLocaleDateString('en-IN')})
    if(pct>=80) fireConfetti()
    // Track weak topics
    questions.forEach(q=>{if(answers[q.id]!==q.correct) addWeak(topic)})
    setPhase('result')
    toast.success(`Quiz complete! ${score}/${questions.length} · +${xp} XP 🏆`)
  }

  function restart(){setPhase('setup');setQuestions([]);setAnswers({});setSubmitted(false)}

  const score=questions.filter(q=>answers[q.id]===q.correct).length
  const pct=questions.length>0?Math.round((score/questions.length)*100):0

  if(phase==='result'){
    return(
      <div className="page-sm" style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',paddingTop:40}}>
        <div style={{fontSize:64,marginBottom:12}}>{pct>=80?'🏆':pct>=60?'⚡':'📚'}</div>
        <h2 style={{fontSize:28,fontWeight:800,color:'#e2e8f0',marginBottom:6}}>
          {pct>=80?'Excellent!':pct>=60?'Good Job!':'Keep Practicing!'}
        </h2>
        <div style={{fontSize:48,fontWeight:900,marginBottom:4}} className={pct>=80?'tG':pct>=60?'tY':'tB'}>{pct}%</div>
        <p style={{color:'#64748b',marginBottom:8}}>{score} out of {questions.length} correct</p>
        <div style={{display:'flex',gap:10,marginBottom:32}}>
          <span className="tag tgY">+{score*20} XP earned</span>
          <span className="tag tgB">{diff} difficulty</span>
          <span className="tag tgG">{topic}</span>
        </div>

        {/* Review */}
        <div style={{width:'100%',textAlign:'left'}}>
          <h3 style={{fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:12}}>Question Review</h3>
          {questions.map((q,i)=>{
            const correct=answers[q.id]===q.correct
            return(
              <div key={q.id} style={{marginBottom:12,padding:'14px 16px',borderRadius:12,border:`1px solid ${correct?'rgba(0,255,136,0.2)':'rgba(239,68,68,0.2)'}`,background:correct?'rgba(0,255,136,0.04)':'rgba(239,68,68,0.04)'}}>
                <div style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8}}>
                  {correct?<CheckCircle size={14} style={{color:'#00ff88',flexShrink:0,marginTop:2}}/>:<XCircle size={14} style={{color:'#ef4444',flexShrink:0,marginTop:2}}/>}
                  <span style={{fontSize:13,color:'#e2e8f0',fontWeight:500}}>Q{i+1}. {q.question}</span>
                </div>
                <div style={{fontSize:12,paddingLeft:22}}>
                  <div style={{color:correct?'#00ff88':'#ef4444',marginBottom:3}}>Your answer: {answers[q.id]||'—'}</div>
                  {!correct&&<div style={{color:'#00ff88',marginBottom:3}}>Correct: {q.correct}</div>}
                  <div style={{color:'#475569',fontStyle:'italic'}}>{q.explanation}</div>
                </div>
              </div>
            )
          })}
        </div>
        <button className="btn bPr bLg" style={{justifyContent:'center',marginTop:16}} onClick={restart}>
          <RotateCcw size={14}/> New Quiz
        </button>
      </div>
    )
  }

  if(phase==='quiz'){
    const answeredCount=Object.keys(answers).length
    return(
      <div className="page-sm">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <h1 style={{fontSize:18,fontWeight:700,color:'#e2e8f0'}}>{topic} Quiz</h1>
            <p style={{fontSize:12,color:'#475569'}}>{answeredCount}/{questions.length} answered · {diff} difficulty</p>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{height:6,width:120,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${(answeredCount/questions.length)*100}%`,background:'linear-gradient(90deg,#7c3aed,#00d4ff)',borderRadius:3,transition:'width .3s'}}/>
            </div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {questions.map((q,i)=>(
            <div key={q.id} className="glass-d" style={{padding:'18px 20px',borderRadius:14}}>
              <p style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:14}}>
                <span style={{color:'#475569',marginRight:8}}>Q{i+1}.</span>{q.question}
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {q.options.map(opt=>{
                  const sel=answers[q.id]===opt
                  return(
                    <button key={opt} onClick={()=>select(q.id,opt)}
                      style={{padding:'10px 14px',borderRadius:9,border:'1px solid',cursor:'pointer',textAlign:'left',fontSize:13,transition:'all .15s',fontFamily:'Exo 2, sans-serif',
                        borderColor:sel?'rgba(0,212,255,0.5)':'rgba(255,255,255,0.06)',
                        background:sel?'rgba(0,212,255,0.1)':'rgba(255,255,255,0.02)',
                        color:sel?'#00d4ff':'#94a3b8'}}>
                      {sel&&<CheckCircle size={12} style={{display:'inline',marginRight:6}}/>}
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{position:'sticky',bottom:0,background:'rgba(3,7,18,0.9)',padding:'14px 0',marginTop:20,backdropFilter:'blur(10px)'}}>
          <button className="btn bGo bLg" style={{justifyContent:'center',width:'100%'}} onClick={submit} disabled={answeredCount<questions.length}>
            <Trophy size={15}/> Submit Quiz ({answeredCount}/{questions.length} answered)
          </button>
        </div>
      </div>
    )
  }

  return(
    <div className="page-sm">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(255,215,0,0.1)',border:'1px solid rgba(255,215,0,0.2)'}}><Zap size={18} style={{color:'#ffd700'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Quiz Generator</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>AI-powered quizzes on any topic</p></div>
      </div>

      <div className="glass-d" style={{padding:28,borderRadius:16,marginBottom:20}}>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:8,fontFamily:'monospace'}}>TOPIC</label>
          <input className="inp" placeholder="e.g. Newton's Laws of Motion, Photosynthesis, Recursion..." value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()}/>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
            {TOPICS.map(t=>(
              <button key={t} onClick={()=>setTopic(t)}
                style={{padding:'4px 10px',borderRadius:16,fontSize:11,border:'1px solid rgba(255,215,0,0.15)',background:topic===t?'rgba(255,215,0,0.1)':'transparent',color:topic===t?'#ffd700':'#475569',cursor:'pointer',transition:'all .15s'}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
          <div>
            <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:8,fontFamily:'monospace'}}>DIFFICULTY</label>
            <div style={{display:'flex',gap:6}}>
              {DIFFS.map(d=>(
                <button key={d} onClick={()=>setDiff(d)}
                  style={{flex:1,padding:'8px 4px',borderRadius:8,fontSize:11,fontWeight:600,border:'1px solid',cursor:'pointer',textTransform:'capitalize',transition:'all .15s',
                    borderColor:diff===d?'rgba(255,215,0,0.4)':'rgba(255,255,255,0.06)',
                    background:diff===d?'rgba(255,215,0,0.1)':'transparent',
                    color:diff===d?'#ffd700':'#64748b'}}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:8,fontFamily:'monospace'}}>QUESTIONS: {count}</label>
            <input type="range" min={3} max={15} value={count} onChange={e=>setCount(+e.target.value)}
              style={{width:'100%',accentColor:'#ffd700'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#334155',marginTop:4}}>
              <span>3</span><span>15</span>
            </div>
          </div>
        </div>

        <button className="btn bGo bLg" style={{justifyContent:'center',width:'100%'}} onClick={generate} disabled={loading||!topic.trim()}>
          {loading?<Loader size={15} style={{animation:'spin 1s linear infinite'}}/>:<Zap size={15}/>}
          {loading?'Generating...':'Generate Quiz'}
        </button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[['🎯','Any Topic','AI generates instantly'],['⚡','3 Difficulty','Easy to Expert'],['🏆','+20 XP','Per correct answer']].map(([e,t,s])=>(
          <div key={t} className="glass" style={{padding:'14px',borderRadius:12,textAlign:'center'}}>
            <div style={{fontSize:20,marginBottom:6}}>{e}</div>
            <div style={{fontSize:12,fontWeight:600,color:'#e2e8f0'}}>{t}</div>
            <div style={{fontSize:10,color:'#475569'}}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
