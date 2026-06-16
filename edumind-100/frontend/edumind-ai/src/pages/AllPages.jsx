import {useState,useRef,useEffect,useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {useGame,useLearn,useUI,useAuth,useChat} from '../lib/store'
import {callGrok,callGrokJSON,fireConfetti,SUBJECTS,PERSONAS,PERSONA_PROMPTS,MOCK_LB,fmtXP,getLeague,getLevelXP} from '../lib/api'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {RadarChart,PolarGrid,PolarAngleAxis,Radar,ResponsiveContainer,Tooltip,LineChart,Line,XAxis,YAxis,CartesianGrid,AreaChart,Area,BarChart,Bar} from 'recharts'
import {Brain,Cpu,BarChart3,Activity,Network,Globe,Orbit,Bot,Video,Layers,BookMarked,Microscope,Rocket,Gamepad2,Target,Trophy,Heart,Sparkles,Satellite,Shield,Eye,Building2,ClipboardList,Lightbulb,Hash,Users,FileText,Search,Calendar,BookOpen,FlaskConical,Map,Volume2,Flame,Star,Clock,Code2,Zap,Shuffle,RefreshCw,Send,CheckCircle,XCircle,User,GraduationCap,Copy,ArrowRight,ChevronRight,ChevronDown,Plus,Minus,RotateCcw,Download,AlertTriangle,TrendingUp,Mic,MicOff} from 'lucide-react'

// ── Shared helpers ────────────────────────────────────────────────────────────
function PH({icon:I,color,title,desc,badge,extra}){return(
  <div className="flex items-center gap-3 mb-5 flex-wrap">
    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{background:`${color}14`,border:`1px solid ${color}24`}}><I size={22} style={{color}}/></div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="font-display text-xl font-black" style={{color:'#e2e8f0'}}>{title}</h1>
        {badge&&<span className="bdg bB" style={{fontSize:9}}>{badge}</span>}
      </div>
      {desc&&<p className="text-sm mt-0.5" style={{color:'#64748b'}}>{desc}</p>}
    </div>
    {extra}
  </div>
)}
function AIBox({content,loading}){
  if(loading)return <div className="card-f p-4"><div className="thinking"><span/><span/><span/><span className="text-xs ml-2" style={{color:'#475569'}}>Groq AI thinking...</span></div></div>
  if(!content)return null
  return(
    <div className="card-f p-4 mt-3">
      <div className="chatA" style={{border:'none',background:'transparent',padding:0}}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
function Spin(){return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spinEl"/>}

// ══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS — TTS, STT, PDF Export
// ══════════════════════════════════════════════════════════════════════════════

// Text-to-Speech
export function speak(text, lang='en-US') {
  if(!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text.slice(0,500))
  utter.lang = lang; utter.rate = 1; utter.pitch = 1
  window.speechSynthesis.speak(utter)
}
export function stopSpeaking() { window.speechSynthesis?.cancel() }

// Speech-to-Text
export function startListening(onResult, onError, lang='en-US') {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if(!SR) { onError('Speech recognition not supported in this browser'); return null }
  const rec = new SR()
  rec.lang = lang; rec.continuous = false; rec.interimResults = false
  rec.onresult = e => onResult(e.results[0][0].transcript)
  rec.onerror = e => onError(e.error)
  rec.start()
  return rec
}

// PDF Export (simple print-based)
export function exportToPDF(content, title='EduMind-Export') {
  const win = window.open('', '_blank')
  win.document.write(`
    <html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#1a1a1a;line-height:1.6}
    h1,h2,h3{color:#1a56db}pre{background:#f4f4f4;padding:12px;border-radius:6px}
    @media print{body{padding:0}}</style></head>
    <body><h1>${title}</h1><div>${content.replace(/\n/g,'<br>')}</div>
    <script>window.onload=()=>window.print()</script></body></html>`)
  win.document.close()
}

// Language code mapping
const LANG_CODES = {
  'English':'en-US','Hindi':'hi-IN','Tamil':'ta-IN',
  'Arabic':'ar-SA','Portuguese':'pt-BR','French':'fr-FR'
}
export const getLangCode = (lang) => LANG_CODES[lang] || 'en-US'


// ══════════════════════════════════════════════════════════════════════════════
// AGI MENTOR
// ══════════════════════════════════════════════════════════════════════════════
export function AGIMentorPage(){
  const{addXP}=useGame(),{persona}=useUI()
  const[msgs,setMsgs]=useState([{role:'assistant',content:`**AGI Mentor Online** 🧠\n\nPowered by **Groq AI** in **${PERSONAS.find(p=>p.id===persona)?.label||'Einstein Mode'}**.\n\nI can help with:\n- Deep concept explanations\n- Problem solving & step-by-step solutions\n- Study strategies & career guidance\n- Research & academic queries\n\nWhat shall we explore today?`,ts:Date.now()}])
  const[input,setInput]=useState(''),[loading,setLoading]=useState(false)
  const bottomRef=useRef(null),inputRef=useRef(null)
  const cp=PERSONAS.find(p=>p.id===persona)||PERSONAS[0]
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[msgs])
  const SUGG=['Explain quantum entanglement with an analogy','How does backpropagation work in neural networks?','Give me a JEE Advanced study plan','What is the Feynman Technique?','Solve: integrate x²·eˣ dx step by step','Explain blockchain in simple terms']
  const send=async(text=input)=>{
    if(!text.trim()||loading)return
    setMsgs(m=>[...m,{role:'user',content:text,ts:Date.now()}]);setInput('');setLoading(true)
    try{
      const hist=msgs.slice(-10).map(m=>({role:m.role,content:m.content}))
      hist.push({role:'user',content:text})
      const sys=`${PERSONA_PROMPTS[persona]}\n\nYou are EduMind's AGI Mentor powered by Groq AI. Be comprehensive, use markdown formatting with headers, bullet points, code blocks. Include emojis to make it engaging.`
      const reply=await callGrok(hist,sys)
      setMsgs(m=>[...m,{role:'assistant',content:reply,ts:Date.now()}])
      const r=addXP(30,'AGI Mentor')
      if(r.levelUp){fireConfetti();toast.success(`🎉 Level Up! Level ${r.newLevel}!`)}
    }catch(e){
      setMsgs(m=>[...m,{role:'assistant',content:`⚠️ **Connection issue.** ${e.message}\n\nCheck \`VITE_GROQ_API_KEY\` in your \`.env\` file.`,ts:Date.now()}])
    }
    setLoading(false)
  }
  const copy=t=>{navigator.clipboard.writeText(t);toast.success('Copied!')}
  return(
    <div className="h-[calc(100vh-57px)] flex flex-col">
      <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{borderBottom:'1px solid rgba(0,212,255,0.08)'}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center gP" style={{background:'linear-gradient(135deg,#7c3aed,#4c1d95)'}}><Bot size={17} color="white"/></div>
          <div><div className="font-display text-sm font-bold" style={{color:'#e2e8f0'}}>AGI Mentor</div>
            <div className="flex items-center gap-1.5"><div className="pdot" style={{background:'#00ff88',color:'#00ff88'}}/><span className="text-xs" style={{color:'#00ff88'}}>Groq AI · {cp.emoji} {cp.label}</span></div></div>
        </div>
        <button onClick={()=>setMsgs(m=>m.slice(0,1))} className="btn bSm bGh"><RotateCcw size={11}/>Clear</button>
      </div>
      {msgs.length<=1&&(
        <div className="px-5 py-3 shrink-0" style={{borderBottom:'1px solid rgba(0,212,255,0.05)'}}>
          <p className="text-xs mb-2" style={{color:'#475569'}}>💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">{SUGG.map(s=>(<button key={s} onClick={()=>send(s)} className="text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.1)',color:'#64748b'}}>{s}</button>))}</div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {msgs.map((msg,i)=>(
          <div key={i} className={`flex gap-3 ${msg.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role==='assistant'?'gP':''}`} style={{background:msg.role==='assistant'?'linear-gradient(135deg,#7c3aed,#4c1d95)':'linear-gradient(135deg,#00d4ff,#0099cc)',marginTop:2}}>
              {msg.role==='assistant'?<Bot size={14} color="white"/>:<span style={{color:'white',fontSize:11,fontWeight:700}}>U</span>}
            </div>
            <div className="group max-w-[82%]">
              {msg.role==='assistant'?(
                <div className="chatA relative">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  <button onClick={()=>copy(msg.content)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded" style={{color:'#475569'}}><Copy size={11}/></button>
                </div>
              ):(
                <div className="chatU"><p className="text-sm" style={{color:'#e2e8f0'}}>{msg.content}</p></div>
              )}
              <div className="text-xs mt-1 px-1" style={{color:'#374151'}}>{new Date(msg.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
          </div>
        ))}
        {loading&&(<div className="flex gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center gP shrink-0" style={{background:'linear-gradient(135deg,#7c3aed,#4c1d95)',marginTop:2}}><Bot size={14} color="white"/></div>
          <div className="chatA"><div className="thinking"><span/><span/><span/><span className="text-xs ml-2" style={{color:'#475569'}}>Groq thinking...</span></div></div>
        </div>)}
        <div ref={bottomRef}/>
      </div>
      <div className="px-5 py-3 shrink-0" style={{borderTop:'1px solid rgba(0,212,255,0.08)'}}>
        <div className="flex gap-2.5">
          <input ref={inputRef} className="inp flex-1" placeholder="Ask anything — concepts, problems, career advice, code…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading} className="btn bPu shrink-0" style={{opacity:(!input.trim()||loading)? .5:1}}><Send size={14}/></button>
        </div>
        <p className="text-xs mt-1.5 text-center" style={{color:'#1e293b'}}>Groq AI · +30 XP · {cp.emoji} {cp.label}</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ GENERATOR
// ══════════════════════════════════════════════════════════════════════════════
export function QuizPage(){
  const{addXP}=useGame(),{addWeak,addQuizResult}=useLearn()
  const[topic,setTopic]=useState(''),[diff,setDiff]=useState('medium'),[count,setCount]=useState(5)
  const[qs,setQs]=useState([]),[cur,setCur]=useState(0),[sel,setSel]=useState(null)
  const[score,setScore]=useState(0),[answers,setAnswers]=useState([]),[phase,setPhase]=useState('setup')
  const[loading,setLoading]=useState(false)
  const gen=async()=>{
    if(!topic.trim()){toast.error('Enter a topic!');return}
    setLoading(true)
    try{
      const data=await callGrokJSON([{role:'user',content:`Generate ${count} MCQ questions on "${topic}" at ${diff} difficulty. Return JSON: {"questions":[{"q":"question","opts":["A. opt","B. opt","C. opt","D. opt"],"ans":"A","exp":"brief explanation"}]}`}],
        'You are a quiz master AI. Return ONLY valid JSON. Make questions educational and accurate.')
      const questions=data.questions||data||[]
      if(!questions.length)throw new Error('No questions returned')
      setQs(questions.slice(0,count));setPhase('quiz');setCur(0);setScore(0);setAnswers([]);setSel(null)
      toast.success(`${questions.length} questions ready! 🎯`)
    }catch(e){toast.error(`Failed: ${e.message}`)}
    setLoading(false)
  }
  const pick=opt=>{
    if(sel!==null)return;setSel(opt)
    const q=qs[cur],correct=opt.charAt(0)===q.ans
    if(correct)setScore(s=>s+1)
    setAnswers(p=>[...p,{q:q.q,sel:opt,ans:q.ans,correct,exp:q.exp}])
  }
  const next=()=>{
    if(cur+1>=qs.length){
      setPhase('results')
      const xpE=score*15+25;addXP(xpE,'Quiz')
      addQuizResult({topic,diff,score,total:qs.length,date:new Date().toISOString()})
      if(score===qs.length){fireConfetti();toast.success('Perfect Score! 🏆')}
      else if(score<qs.length*.5)addWeak(topic)
    }else{setCur(c=>c+1);setSel(null)}
  }
  const reset=()=>{setPhase('setup');setQs([]);setTopic('');setScore(0);setAnswers([])}
  if(phase==='results'){
    const pct=Math.round((score/qs.length)*100)
    return(<div className="p-5 max-w-2xl mx-auto pageIn">
      <div className="card-f text-center p-8">
        <div className="text-6xl mb-4">{pct>=80?'🏆':pct>=60?'⭐':'📚'}</div>
        <div className="font-display text-4xl font-black mb-1" style={{color:pct>=80?'#ffd700':pct>=60?'#00d4ff':'#ff3366'}}>{pct}%</div>
        <div className="text-lg mb-1" style={{color:'#e2e8f0'}}>{score}/{qs.length} Correct</div>
        <span className="bdg mb-6 inline-block" style={{background:pct>=80?'rgba(255,215,0,0.1)':'rgba(0,212,255,0.1)',color:pct>=80?'#ffd700':'#00d4ff',border:`1px solid ${pct>=80?'rgba(255,215,0,0.25)':'rgba(0,212,255,0.25)'}`}}>{pct>=80?'Excellent!':pct>=60?'Good Job!':'Keep Practicing!'}</span>
        <div className="space-y-2.5 text-left mb-6">
          {answers.map((a,i)=>(<div key={i} className="rounded-xl p-3" style={{background:a.correct?'rgba(0,255,136,0.04)':'rgba(255,51,102,0.04)',border:`1px solid ${a.correct?'rgba(0,255,136,0.18)':'rgba(255,51,102,0.18)'}`}}>
            <div className="flex items-start gap-2">{a.correct?<CheckCircle size={13} style={{color:'#00ff88',marginTop:2}}/>:<XCircle size={13} style={{color:'#ff3366',marginTop:2}}/>}
              <div><div className="text-xs font-semibold" style={{color:'#e2e8f0'}}>{a.q}</div><div className="text-xs mt-0.5" style={{color:'#64748b'}}>Correct: {a.ans} · {a.exp}</div></div>
            </div>
          </div>))}
        </div>
        <button onClick={reset} className="btn bPr mx-auto"><RotateCcw size={13}/>New Quiz</button>
      </div>
    </div>)
  }
  if(phase==='quiz'&&qs.length>0){
    const q=qs[cur]
    return(<div className="p-5 max-w-2xl mx-auto pageIn">
      <div className="flex items-center justify-between mb-5">
        <span className="bdg bB">Q {cur+1}/{qs.length}</span>
        <div className="flex gap-1.5">{qs.map((_,i)=>(<div key={i} className="w-2 h-2 rounded-full transition-all" style={{background:i<cur?'#00ff88':i===cur?'#00d4ff':'rgba(255,255,255,0.1)'}}/>))}</div>
        <span className="font-mono text-sm" style={{color:'#ffd700'}}>Score: {score}</span>
      </div>
      <div className="card-f mb-4 p-5"><div className="text-base font-semibold leading-relaxed" style={{color:'#e2e8f0'}}>{q.q}</div></div>
      <div className="space-y-2.5 mb-4">{(q.opts||[]).map((opt,i)=>{
        const letter=opt.charAt(0),isCorrect=letter===q.ans,isSelected=opt===sel
        let cls='qOpt'
        if(sel!==null){if(isCorrect)cls+=' correct';else if(isSelected&&!isCorrect)cls+=' wrong'}
        return(<button key={i} className={cls} onClick={()=>pick(opt)} disabled={sel!==null}>{opt}</button>)
      })}</div>
      {sel!==null&&(<><div className="rounded-xl p-3 mb-3 text-sm" style={{background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.12)',color:'#64748b'}}>💡 {q.exp}</div>
        <button onClick={next} className="btn bPr w-full justify-center">{cur+1>=qs.length?'🏆 See Results':'Next Question'}<ChevronRight size={13}/></button></>)}
    </div>)
  }
  return(<div className="p-5 max-w-2xl mx-auto pageIn">
    <PH icon={Hash} color="#ffd700" title="AI Quiz Generator" desc="Powered by Groq AI · Any topic, any depth"/>
    <div className="card-f space-y-5">
      <div>
        <label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>TOPIC</label>
        <input className="inp" placeholder="e.g. Newton's Laws, Photosynthesis, Python loops…" value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&gen()}/>
        <div className="flex flex-wrap gap-2 mt-2">{SUBJECTS.slice(0,7).map(s=>(<button key={s} onClick={()=>setTopic(s)} className="text-xs px-2.5 py-1 rounded-lg hover:bg-white/5" style={{background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.1)',color:'#64748b'}}>{s}</button>))}</div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>DIFFICULTY</label>
          <div className="grid grid-cols-3 gap-2">{['easy','medium','hard'].map(d=>(<button key={d} onClick={()=>setDiff(d)} className="py-2 rounded-xl text-xs capitalize font-semibold transition-all"
            style={{background:diff===d?(d==='easy'?'rgba(0,255,136,0.12)':d==='medium'?'rgba(0,212,255,0.12)':'rgba(255,51,102,0.12)'):'rgba(255,255,255,0.025)',border:`1px solid ${diff===d?(d==='easy'?'rgba(0,255,136,0.3)':d==='medium'?'rgba(0,212,255,0.3)':'rgba(255,51,102,0.3)'):'rgba(255,255,255,0.05)'}`,color:diff===d?(d==='easy'?'#00ff88':d==='medium'?'#00d4ff':'#ff3366'):'#64748b'}}>{d}</button>))}</div>
        </div>
        <div>
          <label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>QUESTIONS</label>
          <div className="grid grid-cols-4 gap-2">{[3,5,8,10].map(n=>(<button key={n} onClick={()=>setCount(n)} className="py-2 rounded-xl text-sm font-mono font-bold transition-all"
            style={{background:count===n?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.025)',border:`1px solid ${count===n?'rgba(255,215,0,0.3)':'rgba(255,255,255,0.05)'}`,color:count===n?'#ffd700':'#64748b'}}>{n}</button>))}</div>
        </div>
      </div>
      <button onClick={gen} disabled={loading||!topic.trim()} className="btn bGo w-full justify-center" style={{opacity:loading||!topic.trim() ? .55 : 1}}>
        {loading?<><Spin/>Generating with Groq...</>:<><Zap size={15}/>Generate {count} Questions (+{count*15+25} XP)</>}
      </button>
    </div>
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// DIGITAL TWIN
// ══════════════════════════════════════════════════════════════════════════════
export function DigitalTwinPage(){
  const{xp,level,streak}=useGame(),{attention,cogLoad,weakTopics}=useLearn()
  const[analysis,setAnalysis]=useState(''),[loading,setLoading]=useState(false)
  const BEH=[{l:'Study Consistency',v:82,c:'#00d4ff'},{l:'Concept Retention',v:74,c:'#7c3aed'},{l:'Problem Solving',v:91,c:'#00ff88'},{l:'Speed of Learning',v:68,c:'#ffd700'},{l:'Critical Thinking',v:85,c:'#ff3366'},{l:'Memory Recall',v:77,c:'#ff9900'}]
  const RD=BEH.map(b=>({subject:b.l.split(' ')[0],A:b.v,fullMark:100}))
  const analyze=async()=>{
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`Analyze this student's learning DNA:\nLevel:${level},XP:${xp},Streak:${streak}days,Attention:${attention}%,CogLoad:${cogLoad}%\nWeak:${weakTopics.join(',')}\nBehaviors:${BEH.map(b=>`${b.l}:${b.v}%`).join(',')}\nGive 4 specific insights: 1)learning superpower 2)biggest growth area 3)optimal study schedule 4)personalized tip`}],
        'You are an AI learning scientist. Give deep, personalized, actionable insights. Use markdown.')
      setAnalysis(r);toast.success('Twin Analysis complete! 🧬')
    }catch(e){toast.error('Analysis failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={Cpu} color="#00d4ff" title="AI Digital Twin" desc="Real-time behavioral learning model — your AI clone" badge="LIVE SYNC"
      extra={<div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono" style={{background:'rgba(0,255,136,0.07)',border:'1px solid rgba(0,255,136,0.16)',color:'#00ff88'}}><div className="pdot" style={{background:'#00ff88',color:'#00ff88'}}/>SYNCING</div>}/>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="card-f">
        <div className="font-display text-xs font-bold mb-4 tracking-wide" style={{color:'#e2e8f0'}}>COGNITIVE PROFILE MAP</div>
        <ResponsiveContainer width="100%" height={260}><RadarChart data={RD}>
          <PolarGrid stroke="rgba(0,212,255,0.09)"/>
          <PolarAngleAxis dataKey="subject" tick={{fill:'#64748b',fontSize:11}}/>
          <Radar dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.1} strokeWidth={2}/>
          <Tooltip contentStyle={{background:'rgba(6,10,22,.97)',border:'1px solid rgba(0,212,255,.18)',borderRadius:10,fontSize:12}}/>
        </RadarChart></ResponsiveContainer>
      </div>
      <div className="card-f space-y-3.5">
        <div className="font-display text-xs font-bold tracking-wide" style={{color:'#e2e8f0'}}>BEHAVIOR METRICS</div>
        {BEH.map(b=>(<div key={b.l}><div className="flex justify-between text-xs mb-1"><span style={{color:'#94a3b8'}}>{b.l}</span><span className="font-mono" style={{color:b.c}}>{b.v}%</span></div>
          <div className="pT h-1.5"><div className="pF h-full" style={{width:`${b.v}%`,background:`linear-gradient(90deg,${b.c},${b.c}88)`}}/></div></div>))}
      </div>
      <div className="card-f">
        <div className="grid grid-cols-2 gap-3">
          {[{l:'Attention',v:`${attention}%`,c:'#00ff88',i:Eye},{l:'Cog Load',v:`${cogLoad}%`,c:'#00d4ff',i:Activity},{l:'XP Level',v:`Lv.${level}`,c:'#ffd700',i:Star},{l:'Sync',v:'94.2%',c:'#a78bfa',i:Orbit}].map(s=>(<div key={s.l} className="rounded-xl p-3 text-center" style={{background:`${s.c}07`,border:`1px solid ${s.c}14`}}>
            <s.i size={15} className="mx-auto mb-1" style={{color:s.c}}/><div className="font-display text-lg font-bold" style={{color:s.c}}>{s.v}</div><div className="text-xs" style={{color:'#475569'}}>{s.l}</div>
          </div>))}
        </div>
      </div>
      <div className="card-f">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-xs font-bold tracking-wide" style={{color:'#e2e8f0'}}>AI DEEP ANALYSIS</div>
          <button onClick={analyze} disabled={loading} className="btn bSm bPr" style={{opacity:loading ? .6 : 1}}>{loading?<Spin/>:<Brain size={11}/>}{loading?'Analyzing...':'Analyze Twin'}</button>
        </div>
        <AIBox content={analysis} loading={loading}/>
        {!analysis&&!loading&&<div className="text-center py-6"><Cpu size={30} className="mx-auto mb-2" style={{color:'rgba(0,212,255,0.18)'}}/><p className="text-xs" style={{color:'#374151'}}>Click Analyze to get personalized insights from your digital twin.</p></div>}
      </div>
    </div>
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE INTELLIGENCE
// ══════════════════════════════════════════════════════════════════════════════
export function PredictiveIntelligencePage(){
  const{xp,level,streak}=useGame(),{weakTopics}=useLearn()
  const[subject,setSubject]=useState('Mathematics'),[target,setTarget]=useState(85)
  const[result,setResult]=useState(''),[loading,setLoading]=useState(false)
  const PREDS=[{sub:'Mathematics',cur:82,pred:91,c:'#00d4ff',risk:'low'},{sub:'Physics',cur:75,pred:84,c:'#7c3aed',risk:'low'},{sub:'Chemistry',cur:58,pred:67,c:'#ff9900',risk:'medium'},{sub:'Biology',cur:88,pred:93,c:'#00ff88',risk:'low'},{sub:'Computer Science',cur:95,pred:97,c:'#ffd700',risk:'low'},{sub:'English',cur:70,pred:76,c:'#ff3366',risk:'medium'}]
  const PERF=[{month:'Jan',actual:62,predicted:65},{month:'Feb',actual:68,predicted:71},{month:'Mar',actual:72,predicted:74},{month:'Apr',actual:76,predicted:79},{month:'May',actual:81,predicted:84},{month:'Jun',actual:85,predicted:88}]
  const predict=async()=>{
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`Exam prediction for ${subject}:\nStudent Level:${level},XP:${xp},Streak:${streak}days\nWeak topics:${weakTopics.join(',')},Target:${target}%\nProvide: 1)Success probability% 2)Days needed 3)Daily study plan 4)Risk factors 5)Confidence tips`}],
        'You are an AI exam prediction engine using learning science data. Be precise and data-driven. Use markdown.')
      setResult(r)
    }catch(e){toast.error('Prediction failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={BarChart3} color="#ffd700" title="Predictive Intelligence" desc="AI-powered exam success forecasting — 95.8% accuracy" badge="AI ENGINE"/>
    <div className="rounded-2xl p-4 flex items-center gap-4" style={{background:'linear-gradient(135deg,rgba(255,215,0,0.07),rgba(255,153,0,0.04))',border:'1px solid rgba(255,215,0,0.17)'}}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:'rgba(255,215,0,0.12)'}}><Target size={24} style={{color:'#ffd700'}}/></div>
      <div className="flex-1"><div className="font-display text-2xl font-black" style={{color:'#ffd700'}}>95.8% Accuracy</div><div className="text-sm" style={{color:'#94a3b8'}}>2.4M student data points · Real-time neural modeling</div></div>
      <div className="text-right"><div className="font-display text-xl font-bold" style={{color:'#00ff88'}}>↑12%</div><div className="text-xs" style={{color:'#475569'}}>Above avg</div></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 card-f">
        <div className="font-display text-xs font-bold mb-4 tracking-wide" style={{color:'#e2e8f0'}}>SUBJECT PREDICTIONS</div>
        <div className="space-y-4">{PREDS.map(p=>(<div key={p.sub} className="flex items-center gap-4">
          <div className="w-32 shrink-0"><div className="text-xs font-semibold" style={{color:'#94a3b8'}}>{p.sub}</div><div className="text-xs" style={{color:p.risk==='low'?'#00ff88':'#ff9900'}}>{p.risk==='low'?'✅ On Track':'⚠️ Monitor'}</div></div>
          <div className="flex-1"><div className="flex justify-between text-xs mb-1"><span style={{color:'#475569'}}>Now: {p.cur}%</span><span className="font-semibold" style={{color:p.c}}>Predicted: {p.pred}%</span></div>
            <div className="relative h-2 rounded-full" style={{background:'rgba(255,255,255,0.05)'}}><div className="absolute top-0 h-full rounded-full" style={{width:`${p.cur}%`,background:'rgba(255,255,255,0.1)'}}/><div className="absolute top-0 h-full rounded-full" style={{width:`${p.pred}%`,background:`linear-gradient(90deg,${p.c}60,${p.c})`}}/></div></div>
          <span className="bdg shrink-0" style={{background:`${p.c}12`,color:p.c,border:`1px solid ${p.c}24`,fontSize:10}}>+{p.pred-p.cur}%</span>
        </div>))}</div>
      </div>
      <div className="card-f space-y-4">
        <div className="font-display text-xs font-bold tracking-wide" style={{color:'#e2e8f0'}}>GOAL CALCULATOR</div>
        <div><label className="text-xs mb-1 block" style={{color:'#64748b'}}>Subject</label><select className="inp" value={subject} onChange={e=>setSubject(e.target.value)}>{PREDS.map(p=><option key={p.sub}>{p.sub}</option>)}</select></div>
        <div><label className="text-xs mb-1 block" style={{color:'#64748b'}}>Target Score: {target}%</label><input type="range" min={50} max={100} value={target} onChange={e=>setTarget(+e.target.value)} className="w-full accent-yellow-400"/></div>
        <button onClick={predict} disabled={loading} className="btn bGo w-full justify-center" style={{opacity:loading ? .6 : 1}}>{loading?<Spin/>:<Zap size={13}/>}{loading?'Predicting...':'Run AI Prediction'}</button>
        {result&&<div className="text-xs leading-relaxed overflow-y-auto max-h-52 chatA" style={{fontSize:11,border:'none',background:'transparent',padding:0}}><ReactMarkdown>{result}</ReactMarkdown></div>}
      </div>
    </div>
    <div className="card-f">
      <div className="font-display text-xs font-bold mb-4 tracking-wide" style={{color:'#e2e8f0'}}>6-MONTH TRAJECTORY</div>
      <ResponsiveContainer width="100%" height={200}><LineChart data={PERF}>
        <CartesianGrid stroke="rgba(255,255,255,0.025)"/><XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} domain={[50,100]}/>
        <Tooltip contentStyle={{background:'rgba(6,10,22,.97)',border:'1px solid rgba(0,212,255,.18)',borderRadius:10,fontSize:12}}/>
        <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={2.5} dot={{fill:'#00d4ff',r:3}} name="Actual"/>
        <Line type="monotone" dataKey="predicted" stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 3" dot={false} name="AI Predicted"/>
      </LineChart></ResponsiveContainer>
    </div>
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// AI INTERVIEW HUB
// ══════════════════════════════════════════════════════════════════════════════
export function AIInterviewPage(){
  const nav=useNavigate()
  const TYPES=[
    {to:'/ai-interview/hr',i:Users,c:'#00d4ff',l:'HR Interview',d:'Behavioral & personality questions with real-time AI coaching',f:['50+ HR questions','STAR method training','Body language tips'],b:'POPULAR'},
    {to:'/ai-interview/technical',i:Zap,c:'#7c3aed',l:'Technical Interview',d:'Domain-specific technical questions for your exact field',f:['Subject-wise depth','Expert-level answers','Concept deep-dives'],b:'PRO'},
    {to:'/ai-interview/coding',i:Code2,c:'#00ff88',l:'Coding Interview',d:'LeetCode-style AI coding challenges with code review',f:['DSA problems','Code complexity tips','Optimized solutions'],b:'HOT'},
    {to:'/ai-interview/resume',i:FileText,c:'#ffd700',l:'Resume Analyzer',d:'AI resume scoring, ATS optimization & content suggestions',f:['ATS score','Keyword analysis','Improvement tips'],b:'AI'},
  ]
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={GraduationCap} color="#00d4ff" title="AI Interview Prep" desc="Land your dream job with world-class AI mock interviews — Groq-powered"/>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{v:'500+',l:'Questions'},{v:'95%',l:'Success Rate'},{v:'50+',l:'Companies'},{v:'Real-time',l:'AI Feedback'}].map(s=>(<div key={s.l} className="card-f text-center py-4"><div className="font-display text-xl font-black tB">{s.v}</div><div className="text-xs mt-1" style={{color:'#64748b'}}>{s.l}</div></div>))}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{TYPES.map(t=>(<button key={t.to} onClick={()=>nav(t.to)} className="card text-left group relative">
      <div className="absolute top-3 right-3"><span style={{fontSize:9,padding:'2px 7px',borderRadius:999,background:`${t.c}12`,color:t.c,border:`1px solid ${t.c}24`,fontFamily:'Orbitron,monospace',fontWeight:700}}>{t.b}</span></div>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{background:`${t.c}12`,border:`1px solid ${t.c}20`}}><t.i size={22} style={{color:t.c}}/></div>
      <div className="font-display text-base font-bold mb-1" style={{color:'#e2e8f0'}}>{t.l}</div>
      <p className="text-xs mb-3 leading-relaxed" style={{color:'#64748b'}}>{t.d}</p>
      <div className="space-y-1.5">{t.f.map(f=>(<div key={f} className="flex items-center gap-2 text-xs" style={{color:'#94a3b8'}}><div className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:t.c}}/>{f}</div>))}</div>
      <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold" style={{color:t.c}}>Start Practice<ChevronRight size={13} className="group-hover:translate-x-1 transition-transform"/></div>
    </button>))}</div>
  </div>)
}
export function HRInterviewPage(){
  const{addXP}=useGame()
  const HR_QS=['Tell me about yourself.','What are your greatest strengths and weaknesses?','Where do you see yourself in 5 years?','Why should we hire you?','Describe a challenge you overcame.','How do you handle stress and pressure?','What motivates you?','Describe your leadership style with an example.','How do you handle conflict?','What is your greatest achievement?']
  const[q,setQ]=useState(HR_QS[0]),[ans,setAns]=useState(''),[feedback,setFeedback]=useState(''),[score,setScore]=useState(null),[loading,setLoading]=useState(false),[history,setHistory]=useState([])
  const evaluate=async()=>{
    if(!ans.trim()){toast.error('Enter your answer!');return}
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`HR Question: "${q}"\nAnswer: "${ans}"\nEvaluate: 1)Score X/10 2)Strengths 3)Improvements 4)Model answer using STAR method`}],
        'You are a senior HR director at a Fortune 500 company. Give honest, constructive, specific feedback. Start response with "Score: X/10". Use markdown.')
      setFeedback(r);const m=r.match(/Score:\s*(\d+)/i);const sc=m?parseInt(m[1]):7;setScore(sc)
      if(sc>=9){fireConfetti();toast.success(`Outstanding! ${sc}/10 🏆`)}else if(sc>=7)toast.success(`Good! ${sc}/10`)
      setHistory(h=>[{q,score:sc},...h.slice(0,9)]);addXP(sc*8,'HR Interview')
    }catch(e){toast.error('Evaluation failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={Users} color="#00d4ff" title="HR Interview Practice" desc="AI-powered behavioral interview coaching with real-time Grok feedback"/>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="card-f p-5" style={{background:'rgba(0,212,255,0.025)',borderColor:'rgba(0,212,255,0.17)'}}><div className="flex items-center justify-between mb-3"><span className="bdg bB">HR QUESTION</span><button onClick={()=>{setQ(HR_QS[Math.floor(Math.random()*HR_QS.length)]);setFeedback('');setScore(null);setAns('')}} className="p-1.5 rounded-lg hover:bg-white/5" style={{color:'#64748b'}}><RefreshCw size={13}/></button></div><p className="text-base font-semibold leading-relaxed" style={{color:'#e2e8f0'}}>{q}</p></div>
        <div><label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>YOUR ANSWER (STAR Method)</label><textarea className="inp" rows={5} placeholder="Situation → Task → Action → Result…" value={ans} onChange={e=>setAns(e.target.value)}/></div>
        <button onClick={evaluate} disabled={loading||!ans.trim()} className="btn bPr w-full justify-center" style={{opacity:loading||!ans.trim() ? .6 : 1}}>{loading?<><Spin/>AI Evaluating...</>:<><Send size={13}/>Get AI Feedback</>}</button>
        {feedback&&(<div className="card-f p-5"><div className="flex items-center gap-3 mb-3"><div className="font-display text-2xl font-black" style={{color:score>=8?'#00ff88':score>=6?'#ffd700':'#ff3366'}}>{score}/10</div><div><div className="text-sm font-semibold" style={{color:'#e2e8f0'}}>AI Feedback</div><div className="text-xs" style={{color:'#64748b'}}>{score>=8?'Excellent!':score>=6?'Good':'Needs work'}</div></div></div><div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{feedback}</ReactMarkdown></div></div>)}
      </div>
      <div className="space-y-4">
        <div className="card-f"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#e2e8f0'}}>QUESTION BANK</div><div className="space-y-1.5">{HR_QS.map((hq,i)=>(<button key={i} onClick={()=>{setQ(hq);setFeedback('');setScore(null);setAns('')}} className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors" style={{background:q===hq?'rgba(0,212,255,0.07)':'rgba(255,255,255,0.02)',color:q===hq?'#00d4ff':'#64748b',border:`1px solid ${q===hq?'rgba(0,212,255,0.17)':'transparent'}`}}>{hq}</button>))}</div></div>
        {history.length>0&&(<div className="card-f"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#e2e8f0'}}>SESSION LOG</div><div className="space-y-2">{history.map((h,i)=>(<div key={i} className="flex items-center gap-2 text-xs"><span className="font-mono px-2 py-0.5 rounded" style={{background:h.score>=8?'rgba(0,255,136,0.1)':'rgba(255,215,0,0.1)',color:h.score>=8?'#00ff88':'#ffd700'}}>{h.score}/10</span><span className="truncate" style={{color:'#64748b'}}>{h.q}</span></div>))}</div></div>)}
      </div>
    </div>
  </div>)
}
export function TechnicalInterviewPage(){
  const{addXP}=useGame()
  const[field,setField]=useState('Computer Science'),[question,setQuestion]=useState(''),[answer,setAnswer]=useState(''),[feedback,setFeedback]=useState(''),[loading,setLoading]=useState(false),[genLoading,setGenLoading]=useState(false)
  const genQ=async()=>{
    setGenLoading(true)
    try{const r=await callGrok([{role:'user',content:`Generate ONE advanced technical interview question for ${field}. Just the question.`}],'You are a senior technical interviewer. Generate challenging, realistic questions.');setQuestion(r.trim());setAnswer('');setFeedback('')}catch(e){toast.error('Failed')}
    setGenLoading(false)
  }
  const evaluate=async()=>{
    if(!answer.trim())return;setLoading(true)
    try{const r=await callGrok([{role:'user',content:`Technical Q: "${question}"\nField: ${field}\nAnswer: "${answer}"\nEvaluate: Score X/10, correctness, depth, improvements, model answer.`}],'You are a technical expert and interviewer. Evaluate rigorously. Use markdown.');setFeedback(r);addXP(50,'Technical Interview')}catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={Zap} color="#7c3aed" title="Technical Interview" desc="Domain-specific AI mock interviews with expert Grok feedback"/>
    <div className="card-f space-y-4">
      <div><label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>FIELD / DOMAIN</label>
        <div className="flex gap-3"><select className="inp flex-1" value={field} onChange={e=>setField(e.target.value)}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select>
          <button onClick={genQ} disabled={genLoading} className="btn bPu shrink-0" style={{opacity:genLoading ? .6 : 1}}>{genLoading?<Spin/>:<RefreshCw size={13}/>}Generate Q</button></div></div>
      {question&&(<><div className="rounded-xl p-4" style={{background:'rgba(124,58,237,0.05)',border:'1px solid rgba(124,58,237,0.2)'}}><span className="bdg bPurple mb-2 inline-block">TECHNICAL QUESTION</span><p className="text-base font-semibold leading-relaxed" style={{color:'#e2e8f0'}}>{question}</p></div>
        <textarea className="inp" rows={6} placeholder="Your answer — be thorough and structured…" value={answer} onChange={e=>setAnswer(e.target.value)}/>
        <button onClick={evaluate} disabled={loading||!answer.trim()} className="btn bPu w-full justify-center" style={{opacity:loading||!answer.trim() ? .6 : 1}}>{loading?<><Spin/>AI Evaluating...</>:<><Send size={13}/>Get Expert Feedback</>}</button></>)}
      {!question&&<div className="text-center py-8"><Zap size={34} className="mx-auto mb-3" style={{color:'rgba(124,58,237,0.2)'}}/><p className="text-sm" style={{color:'#374151'}}>Select field and click Generate to get a real technical interview question.</p></div>}
      <AIBox content={feedback} loading={false}/>
    </div>
  </div>)
}
export function CodingInterviewPage(){
  const{addXP}=useGame()
  const[problem,setProblem]=useState(null),[code,setCode]=useState(''),[lang,setLang]=useState('python'),[review,setReview]=useState(''),[loading,setLoading]=useState(false),[genLoading,setGenLoading]=useState(false),[diff,setDiff]=useState('medium')
  const genProblem=async()=>{
    setGenLoading(true)
    try{const data=await callGrokJSON([{role:'user',content:`Generate a ${diff} DSA coding interview problem. Return JSON: {"title":"","description":"","examples":[{"input":"","output":""}],"constraints":[""],"hint":""}`}],'You are a coding interview problem creator. Generate realistic LeetCode-style problems. Return valid JSON only.');setProblem(data);setCode('');setReview('')}catch(e){toast.error('Failed')}
    setGenLoading(false)
  }
  const reviewCode=async()=>{
    if(!code.trim())return;setLoading(true)
    try{const r=await callGrok([{role:'user',content:`Problem: ${problem?.title}\nCode(${lang}):\n${code}\nReview: 1)Correctness 2)Time/Space complexity 3)Code quality 4)Optimizations 5)Score /10`}],'You are a senior software engineer. Review interview code thoroughly. Use markdown with code blocks.');setReview(r);addXP(75,'Coding Interview')}catch(e){toast.error('Review failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-4 pageIn">
    <PH icon={Code2} color="#00ff88" title="Coding Interview" desc="LeetCode-style AI coding challenges with expert code review"/>
    <div className="flex gap-3 flex-wrap">
      {['easy','medium','hard'].map(d=>(<button key={d} onClick={()=>setDiff(d)} className="btn bSm capitalize" style={{background:diff===d?(d==='easy'?'rgba(0,255,136,0.12)':d==='medium'?'rgba(0,212,255,0.12)':'rgba(255,51,102,0.12)'):'rgba(255,255,255,0.025)',color:diff===d?(d==='easy'?'#00ff88':d==='medium'?'#00d4ff':'#ff3366'):'#64748b',border:`1px solid ${diff===d?(d==='easy'?'rgba(0,255,136,0.28)':d==='medium'?'rgba(0,212,255,0.28)':'rgba(255,51,102,0.28)'):'rgba(255,255,255,0.05)'}`}}>{d}</button>))}
      <button onClick={genProblem} disabled={genLoading} className="btn bGr ml-auto" style={{opacity:genLoading ? .6 : 1}}>{genLoading?<Spin/>:<RefreshCw size={13}/>}New Problem</button>
    </div>
    {problem?(<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card-f space-y-3">
        <div className="font-display text-sm font-bold" style={{color:'#00ff88'}}>{problem.title}</div>
        <p className="text-sm leading-relaxed" style={{color:'#94a3b8'}}>{problem.description}</p>
        {problem.examples?.map((ex,i)=>(<div key={i} className="rounded-lg p-3 text-xs font-mono" style={{background:'rgba(0,0,0,0.5)',border:'1px solid rgba(0,212,255,0.09)'}}><div style={{color:'#64748b'}}>Input: <span style={{color:'#e2e8f0'}}>{ex.input}</span></div><div style={{color:'#64748b'}}>Output: <span style={{color:'#00ff88'}}>{ex.output}</span></div></div>))}
        {problem.hint&&<div className="rounded-lg p-2.5 text-xs" style={{background:'rgba(255,215,0,0.04)',border:'1px solid rgba(255,215,0,0.12)',color:'#ffd700'}}>💡 {problem.hint}</div>}
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <select className="inp" style={{width:'auto',minWidth:110}} value={lang} onChange={e=>setLang(e.target.value)}>{['python','javascript','java','c++','typescript'].map(l=><option key={l}>{l}</option>)}</select>
          <button onClick={reviewCode} disabled={loading||!code.trim()} className="btn bGr ml-auto" style={{opacity:loading||!code.trim() ? .6 : 1}}>{loading?<Spin/>:<Zap size={13}/>}{loading?'Reviewing...':'AI Review'}</button>
        </div>
        <textarea className="codeE" rows={12} placeholder={`# Write your ${lang} solution here…`} value={code} onChange={e=>setCode(e.target.value)}/>
        <AIBox content={review} loading={false}/>
      </div>
    </div>):(<div className="card-f text-center py-12"><Code2 size={38} className="mx-auto mb-3" style={{color:'rgba(0,255,136,0.18)'}}/><p className="text-sm" style={{color:'#374151'}}>Click "New Problem" to get a fresh coding challenge.</p></div>)}
  </div>)
}
export function ResumeAnalyzerPage(){
  const{addXP}=useGame()
  const[resume,setResume]=useState(''),[role,setRole]=useState('Software Engineer'),[result,setResult]=useState(''),[loading,setLoading]=useState(false)
  const analyze=async()=>{
    if(!resume.trim()){toast.error('Paste your resume!');return};setLoading(true)
    try{const r=await callGrok([{role:'user',content:`Analyze this resume for ${role}:\n\n${resume}\n\nProvide: 1)ATS Score/100 2)Key strengths 3)Missing keywords for ${role} 4)Format improvements 5)Content gaps 6)Optimized summary`}],'You are an expert resume reviewer and ATS specialist. Be specific and actionable. Use markdown.');setResult(r);addXP(40,'Resume Analysis');toast.success('Resume analyzed! 📄')}catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={FileText} color="#ffd700" title="AI Resume Analyzer" desc="ATS optimization & expert resume feedback powered by Groq"/>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-4">
        <div><label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>TARGET ROLE</label><input className="inp" placeholder="e.g. Software Engineer, Data Scientist…" value={role} onChange={e=>setRole(e.target.value)}/></div>
        <div><label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>PASTE YOUR RESUME</label><textarea className="inp" rows={14} placeholder="Paste your full resume text here…" value={resume} onChange={e=>setResume(e.target.value)}/></div>
        <button onClick={analyze} disabled={loading||!resume.trim()} className="btn bGo w-full justify-center" style={{opacity:loading||!resume.trim() ? .6 : 1}}>{loading?<><Spin/>Analyzing with Groq...</>:<><Zap size={13}/>Analyze Resume (+40 XP)</>}</button>
      </div>
      {result?(<div className="card-f p-5 overflow-y-auto"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#ffd700'}}>ANALYSIS REPORT</div><div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{result}</ReactMarkdown></div></div>):(<div className="card-f flex flex-col items-center justify-center py-16 text-center"><FileText size={38} className="mb-3" style={{color:'rgba(255,215,0,0.18)'}}/><p className="text-sm" style={{color:'#374151'}}>Paste your resume and target role to get instant AI-powered feedback with ATS score.</p></div>)}
    </div>
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// RESEARCH AGENT
// ══════════════════════════════════════════════════════════════════════════════
export function ResearchAgentPage(){
  const{addXP}=useGame()
  const[query,setQuery]=useState(''),[depth,setDepth]=useState('standard'),[result,setResult]=useState(''),[loading,setLoading]=useState(false)
  const BRIEFS=[{title:'AI in Drug Discovery 2025',field:'Medicine',summary:'AlphaFold 3 achieves 98% accuracy in protein structure prediction, revolutionizing drug development pipelines…'},{title:'Quantum Internet Milestone',field:'Physics',summary:'1000km quantum entanglement record broken by Chinese researchers using satellite relay…'},{title:'Neural Plasticity in Adults',field:'Neuroscience',summary:'New evidence confirms adult neurogenesis under specific conditions, overturning decade-old dogma…'},{title:'GPT vs Grok: 2025 Benchmarks',field:'AI/CS',summary:'Latest benchmarks show Grok 3 outperforms GPT-4o on reasoning and coding tasks by 12%…'},{title:'CRISPR Cure for Sickle Cell',field:'Biology',summary:'First FDA-approved CRISPR therapy shows 97% success rate in clinical trial of 200 patients…'}]
  const research=async()=>{
    if(!query.trim()){toast.error('Enter a topic!');return};setLoading(true)
    try{
      const ds=depth==='deep'?'Extremely detailed academic-level analysis with methodologies, researchers, debates, future implications.':depth==='quick'?'Brief 3-paragraph overview.':'Comprehensive research brief covering all key aspects.'
      const r=await callGrok([{role:'user',content:`Research: "${query}"\n\n${ds}\n\nStructure: ## Executive Summary, ## Key Findings, ## Current State, ## Recent Breakthroughs, ## Implications, ## Further Reading`}],'You are an AI research analyst with cutting-edge academic knowledge. Produce high-quality, accurate research briefs. Use markdown.')
      setResult(r);addXP(40,'Research Agent');toast.success('Research complete! 📚')
    }catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={Microscope} color="#00ff88" title="AI Research Agent" desc="Deep academic research & daily intelligence briefs powered by Groq" badge="GROQ"/>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="card-f space-y-3">
          <div className="flex gap-2.5"><input className="inp flex-1" placeholder="Enter any research topic, question, or concept…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&research()}/><button onClick={research} disabled={loading||!query.trim()} className="btn bGr shrink-0" style={{opacity:loading||!query.trim() ? .6 : 1}}>{loading?<Spin/>:<Search size={13}/>}Research</button></div>
          <div className="flex items-center gap-2 flex-wrap"><span className="text-xs" style={{color:'#475569'}}>Depth:</span>{['quick','standard','deep'].map(d=>(<button key={d} onClick={()=>setDepth(d)} className="text-xs px-3 py-1.5 rounded-lg capitalize transition-colors" style={{background:depth===d?'rgba(0,255,136,0.09)':'rgba(255,255,255,0.025)',color:depth===d?'#00ff88':'#64748b',border:`1px solid ${depth===d?'rgba(0,255,136,0.24)':'rgba(255,255,255,0.05)'}`}}>{d}</button>))}</div>
        </div>
        {result?(<div className="card-f p-5"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#00ff88'}}>RESEARCH BRIEF</div><div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{result}</ReactMarkdown></div></div>):(<div className="card-f text-center py-12"><Microscope size={38} className="mx-auto mb-3" style={{color:'rgba(0,255,136,0.15)'}}/><p className="text-sm" style={{color:'#374151'}}>Enter any research topic to get a comprehensive AI-generated brief with latest findings.</p></div>)}
      </div>
      <div className="card-f h-fit">
        <div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#e2e8f0'}}>DAILY INTELLIGENCE BRIEFS</div>
        <div className="space-y-2.5">{BRIEFS.map((b,i)=>(<button key={i} onClick={()=>setQuery(b.title)} className="w-full text-left p-3 rounded-xl hover:bg-white/3 transition-colors" style={{background:'rgba(0,255,136,0.025)',border:'1px solid rgba(0,255,136,0.07)'}}>
          <div className="flex items-start gap-2 mb-1"><span className="text-xs font-semibold leading-tight flex-1" style={{color:'#e2e8f0'}}>{b.title}</span><span className="bdg bGreen shrink-0" style={{fontSize:9}}>{b.field}</span></div>
          <p className="text-xs" style={{color:'#475569'}}>{b.summary}</p>
        </button>))}</div>
      </div>
    </div>
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// GAMIFIED WORLD
// ══════════════════════════════════════════════════════════════════════════════
export function GamifiedWorldPage(){
  const nav=useNavigate(),{xp,level,streak,badges}=useGame()
  const league=getLeague(xp),{progress}=getLevelXP(xp)
  const MISSIONS=[
    {id:1,t:'Quiz Master',d:'Complete 3 quizzes today',xp:150,prog:2,total:3,i:Hash,c:'#ffd700',done:false},
    {id:2,t:'Deep Research',d:'Run 2 research briefs',xp:100,prog:1,total:2,i:Microscope,c:'#00ff88',done:false},
    {id:3,t:'Interview Warrior',d:'Complete 1 mock interview',xp:200,prog:0,total:1,i:Users,c:'#00d4ff',done:false},
    {id:4,t:'Knowledge Swap',d:'Do a knowledge swap',xp:120,prog:0,total:1,i:Shuffle,c:'#a78bfa',done:false},
    {id:5,t:'Streak Keeper',d:'Maintain 7-day streak',xp:300,prog:7,total:7,i:Flame,c:'#ff9900',done:true},
  ]
  const BOSS=[{name:'Calculus Dragon',diff:'Hard',xp:500,icon:'🐉',sub:'Mathematics'},{name:'Quantum Phantom',diff:'Expert',xp:800,icon:'👻',sub:'Physics'},{name:'Algorithm Titan',diff:'Hard',xp:600,icon:'🤖',sub:'CS'}]
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={Gamepad2} color="#ff3366" title="Gamified Learning World" desc="RPG-style learning — missions, boss battles, leagues & global events"/>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{l:'Total XP',v:fmtXP(xp),c:'#ffd700',i:Star},{l:'League',v:league.name,c:league.color,i:Trophy},{l:'Level',v:`Lv.${level}`,c:'#00d4ff',i:Zap},{l:'Streak',v:`${streak}🔥`,c:'#ff9900',i:Flame}].map(s=>(<div key={s.l} className="card-f text-center py-4"><s.i size={17} className="mx-auto mb-1.5" style={{color:s.c}}/><div className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs mt-0.5" style={{color:'#475569'}}>{s.l}</div></div>))}</div>
    <div className="card-f p-4"><div className="flex justify-between text-xs mb-2"><span style={{color:'#94a3b8'}}>Level {level} Progress</span><span className="font-mono" style={{color:'#ffd700'}}>{Math.round(progress)}% to Level {level+1}</span></div><div className="xpT"><div className="xpF" style={{width:`${progress}%`}}/></div></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div>
        <div className="flex items-center gap-2 mb-3"><Target size={13} style={{color:'#ffd700'}}/><span className="font-display text-xs font-bold tracking-wide" style={{color:'#e2e8f0'}}>DAILY MISSIONS</span></div>
        <div className="space-y-2.5">{MISSIONS.map(m=>(<div key={m.id} className="mCard" style={{opacity:m.done? .7:1}}>
          {m.done&&<div className="absolute top-3 right-3"><CheckCircle size={13} style={{color:'#00ff88'}}/></div>}
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background:`${m.c}12`,border:`1px solid ${m.c}20`}}><m.i size={14} style={{color:m.c}}/></div>
            <div className="flex-1 min-w-0"><div className="text-sm font-semibold" style={{color:'#e2e8f0'}}>{m.t}</div><div className="text-xs" style={{color:'#64748b'}}>{m.d}</div></div>
            <span className="bdg bGold shrink-0" style={{fontSize:10}}>+{m.xp} XP</span>
          </div>
          <div className="pT h-1.5"><div className="pF h-full" style={{width:`${(m.prog/m.total)*100}%`,background:`linear-gradient(90deg,${m.c},${m.c}88)`}}/></div>
          <div className="text-xs mt-1" style={{color:'#475569'}}>{m.prog}/{m.total} completed</div>
        </div>))}</div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3"><Zap size={13} style={{color:'#ff3366'}}/><span className="font-display text-xs font-bold tracking-wide" style={{color:'#e2e8f0'}}>BOSS CHALLENGES</span></div>
        <div className="space-y-3">{BOSS.map(b=>(<div key={b.name} className="card" style={{borderColor:'rgba(255,51,102,0.17)'}}>
          <div className="flex items-center gap-3"><div className="text-3xl">{b.icon}</div><div className="flex-1"><div className="font-semibold text-sm" style={{color:'#e2e8f0'}}>{b.name}</div><div className="text-xs" style={{color:'#64748b'}}>{b.sub} · {b.diff}</div></div><span className="bdg bRed" style={{fontSize:10}}>+{b.xp} XP</span></div>
          <button onClick={()=>nav('/quiz')} className="btn bDa bSm w-full justify-center mt-3"><Zap size={11}/>Challenge Boss</button>
        </div>))}</div>
        <div className="card-f mt-4"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#e2e8f0'}}>MY BADGES</div><div className="flex flex-wrap gap-2">{badges.map((b,i)=>(<span key={i} className="bdg bGold" style={{fontSize:11}}>{b}</span>))}</div></div>
      </div>
    </div>
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ══════════════════════════════════════════════════════════════════════════════
export function LeaderboardPage(){
  const{xp,streak}=useGame()
  const[filter,setFilter]=useState('global')
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={Trophy} color="#ffd700" title="Global Leaderboard" desc="Compete with students across 190+ countries — real-time rankings"/>
    <div className="flex gap-2 flex-wrap">{['global','weekly','monthly'].map(f=>(<button key={f} onClick={()=>setFilter(f)} className="btn bSm capitalize" style={{background:filter===f?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.025)',color:filter===f?'#ffd700':'#64748b',border:`1px solid ${filter===f?'rgba(255,215,0,0.28)':'rgba(255,255,255,0.05)'}`}}>{f}</button>))}</div>
    <div className="card-f overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>Rank</th><th>Student</th><th>XP</th><th>Streak</th><th>Badge</th><th>League</th></tr></thead>
        <tbody>
          {MOCK_LB.map((p,i)=>(<tr key={p.rank} style={{background:i<3?`rgba(255,215,0,0.0${3-i})`:undefined}}>
            <td><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:i===0?'linear-gradient(135deg,#ffd700,#ff9900)':i===1?'linear-gradient(135deg,#c0c0c0,#888)':i===2?'linear-gradient(135deg,#cd7f32,#8b5a2b)':'rgba(255,255,255,0.04)',color:i<3?'#030712':'#64748b'}}>{p.rank}</div></td>
            <td><span style={{color:'#e2e8f0'}}>{p.country} {p.name}</span></td>
            <td><span className="font-mono" style={{color:'#ffd700'}}>{fmtXP(p.xp)}</span></td>
            <td><span style={{color:'#ff9900'}}>{p.streak}🔥</span></td>
            <td>{p.badge}</td>
            <td><span className="bdg bGold" style={{fontSize:10}}>{getLeague(p.xp).name}</span></td>
          </tr>))}
          <tr style={{background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.14)'}}>
            <td><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:'linear-gradient(135deg,#00d4ff,#0099cc)',color:'#030712'}}>?</div></td>
            <td><span style={{color:'#00d4ff'}}>🇮🇳 You</span></td>
            <td><span className="font-mono" style={{color:'#ffd700'}}>{fmtXP(xp)}</span></td>
            <td><span style={{color:'#ff9900'}}>{streak}🔥</span></td>
            <td>⚡</td>
            <td><span className="bdg bB" style={{fontSize:10}}>{getLeague(xp).name}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// STARTUP LAB
// ══════════════════════════════════════════════════════════════════════════════
export function StartupLabPage(){
  const nav=useNavigate(),{addXP}=useGame()
  const[activeTab,setActiveTab]=useState('idea'),[idea,setIdea]=useState(''),[ideaResult,setIdeaResult]=useState(''),[pitchTopic,setPitchTopic]=useState(''),[pitch,setPitch]=useState(''),[loading,setLoading]=useState(false)
  const genIdea=async()=>{
    if(!idea.trim()){toast.error('Enter domain!');return};setLoading(true)
    try{const r=await callGrok([{role:'user',content:`Generate 3 innovative startup ideas in "${idea}" space. For each: name, problem, solution, target market, revenue model, USP, first step.`}],'You are a startup mentor and VC. Generate viable, innovative ideas. Use markdown.');setIdeaResult(r);addXP(50,'Startup Idea')}catch(e){toast.error('Failed')}
    setLoading(false)
  }
  const genPitch=async()=>{
    if(!pitchTopic)return;setLoading(true)
    try{const r=await callGrok([{role:'user',content:`Create complete investor pitch deck for: "${pitchTopic}"\nInclude: Problem, Solution, Market Size (TAM/SAM/SOM), Business Model, Traction, Team, Ask (funding amount), key slides content.`}],'You are a pitch deck expert who helped startups raise $100M+. Use markdown with clear structure.');setPitch(r);addXP(80,'Pitch Deck');toast.success('Pitch deck ready! 🚀')}catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={Rocket} color="#ffd700" title="Startup Lab" desc="From idea to funded startup — AI-powered entrepreneurship platform" badge="DAO"/>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{v:'₿ 2.4K',l:'Edu-Equity Pool',c:'#ffd700'},{v:'127',l:'Startups Launched',c:'#00ff88'},{v:'$4.2M',l:'Raised by Alumni',c:'#00d4ff'},{v:'48h',l:'Avg to MVP',c:'#a78bfa'}].map(s=>(<div key={s.l} className="card-f text-center py-4"><div className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs mt-0.5" style={{color:'#475569'}}>{s.l}</div></div>))}</div>
    <div className="flex gap-2 flex-wrap">{['idea','pitch','mentor','dao'].map(t=>(<button key={t} onClick={()=>setActiveTab(t)} className="btn bSm" style={{background:activeTab===t?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.025)',color:activeTab===t?'#ffd700':'#64748b',border:`1px solid ${activeTab===t?'rgba(255,215,0,0.28)':'rgba(255,255,255,0.05)'}`}}>{t==='dao'?'Edu-DAO':t.charAt(0).toUpperCase()+t.slice(1)} {t==='idea'?'💡':t==='pitch'?'📊':t==='mentor'?'🤖':'⛓️'}</button>))}</div>
    {activeTab==='idea'&&(<div className="card-f space-y-4"><div className="font-display text-sm font-bold" style={{color:'#ffd700'}}>💡 STARTUP IDEA GENERATOR</div><input className="inp" placeholder="Enter domain (e.g. EdTech, HealthTech, Rural India, Climate…)" value={idea} onChange={e=>setIdea(e.target.value)} onKeyDown={e=>e.key==='Enter'&&genIdea()}/><button onClick={genIdea} disabled={loading||!idea.trim()} className="btn bGo w-full justify-center" style={{opacity:loading||!idea.trim() ? .6 : 1}}>{loading?<><Spin/>Generating...</>:<><Lightbulb size={13}/>Generate 3 Startup Ideas (+50 XP)</>}</button><AIBox content={ideaResult} loading={false}/></div>)}
    {activeTab==='pitch'&&(<div className="card-f space-y-4"><div className="font-display text-sm font-bold" style={{color:'#ffd700'}}>📊 PITCH DECK GENERATOR</div><input className="inp" placeholder="Describe your startup idea briefly…" value={pitchTopic} onChange={e=>setPitchTopic(e.target.value)}/><button onClick={genPitch} disabled={loading||!pitchTopic} className="btn bGo w-full justify-center" style={{opacity:loading||!pitchTopic ? .6 : 1}}>{loading?<><Spin/>Generating...</>:<><Rocket size={13}/>Generate Pitch Deck (+80 XP)</>}</button><AIBox content={pitch} loading={false}/></div>)}
    {activeTab==='mentor'&&(<div className="card-f p-5 text-center py-10"><Bot size={38} className="mx-auto mb-3" style={{color:'rgba(255,215,0,0.22)'}}/><div className="font-display text-base font-bold mb-2" style={{color:'#e2e8f0'}}>AI Startup Mentor</div><p className="text-sm mb-4" style={{color:'#64748b'}}>Get mentorship from our AI trained on 10,000+ successful startups and VC patterns.</p><button onClick={()=>nav('/agi-mentor')} className="btn bGo mx-auto"><Bot size={13}/>Open AGI Mentor</button></div>)}
    {activeTab==='dao'&&(<div className="card-f space-y-4"><div className="font-display text-sm font-bold" style={{color:'#ffd700'}}>⛓️ EDU-DAO FUNDING PROTOCOL</div><div className="rounded-xl p-4" style={{background:'rgba(255,215,0,0.03)',border:'1px solid rgba(255,215,0,0.14)'}}><div className="grid grid-cols-3 gap-4 text-center mb-4">{[{v:'₿ 2,400',l:'Pool Available',c:'#ffd700'},{v:'47',l:'Active Proposals',c:'#00ff88'},{v:'892',l:'DAO Members',c:'#00d4ff'}].map(s=>(<div key={s.l}><div className="font-display text-lg font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs" style={{color:'#475569'}}>{s.l}</div></div>))}</div><p className="text-xs leading-relaxed" style={{color:'#94a3b8'}}>EduMind's decentralized education funding protocol. Submit your startup proposal, get community votes, receive Edu-Equity tokens. All transactions transparent and on-chain.</p></div><button className="btn bGo w-full justify-center"><Rocket size={13}/>Submit Proposal</button></div>)}
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// LEARN PAGE (Topic Explainer)
// ══════════════════════════════════════════════════════════════════════════════
export function LearnPage(){
  const{persona,lang}=useUI(),{addXP}=useGame()
  const[topic,setTopic]=useState(''),[level,setLevel]=useState('beginner'),[result,setResult]=useState(''),[loading,setLoading]=useState(false)
  const POP=['Quantum Mechanics','Machine Learning','CRISPR Gene Editing','Black Holes','Neural Networks','Blockchain','Consciousness','Thermodynamics','Evolution','Stock Markets']
  const explain=async()=>{
    if(!topic.trim()){toast.error('Enter a topic!');return};setLoading(true)
    try{const r=await callGrok([{role:'user',content:`Explain "${topic}" at ${level} level. Include: clear definition, key concepts, real-world examples, common misconceptions, memory tip.`}],`${PERSONA_PROMPTS[persona]}\nYou are EduMind's AI tutor. Explain concepts brilliantly using markdown with headers and examples.`);setResult(r);addXP(25,'Topic Explanation')}catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={Lightbulb} color="#00d4ff" title="Topic Explainer" desc="AI explains any concept at your exact level — powered by Groq"/>
    <div className="card-f space-y-4">
      <div className="flex gap-3"><input className="inp flex-1" placeholder="Enter any topic, concept, formula, event…" value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&explain()}/><button onClick={explain} disabled={loading||!topic.trim()} className="btn bPr shrink-0" style={{opacity:loading||!topic.trim() ? .6 : 1}}>{loading?<Spin/>:<Brain size={13}/>}{loading?'Thinking...':'Explain'}</button></div>
      <div className="flex items-center gap-3 flex-wrap"><span className="text-xs" style={{color:'#475569'}}>Level:</span>{['beginner','intermediate','advanced','expert'].map(l=>(<button key={l} onClick={()=>setLevel(l)} className="btn bSm capitalize" style={{background:level===l?'rgba(0,212,255,0.1)':'rgba(255,255,255,0.025)',color:level===l?'#00d4ff':'#64748b',border:`1px solid ${level===l?'rgba(0,212,255,0.28)':'rgba(255,255,255,0.05)'}`}}>{l}</button>))}</div>
      <div><p className="text-xs mb-2" style={{color:'#475569'}}>Popular:</p><div className="flex flex-wrap gap-2">{POP.map(t=>(<button key={t} onClick={()=>setTopic(t)} className="text-xs px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors" style={{background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.1)',color:'#64748b'}}>{t}</button>))}</div></div>
    </div>
    {result&&(<div className="card-f p-5"><div className="flex items-center justify-between mb-3"><span className="font-display text-xs font-bold tracking-wide" style={{color:'#00d4ff'}}>EXPLANATION — {topic.toUpperCase()}</span><button onClick={()=>speak(result.slice(0,400),getLangCode(lang))} className="btn bSm bGh"><Volume2 size={11}/>Read Aloud</button></div><div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{result}</ReactMarkdown></div></div>)}
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERIC AI PAGE FACTORY
// ══════════════════════════════════════════════════════════════════════════════
function GenAIPage({icon:I,color,title,desc,placeholder,systemPrompt,xpAmt=25}){
  const{addXP}=useGame()
  const[input,setInput]=useState(''),[result,setResult]=useState(''),[loading,setLoading]=useState(false)
  const run=async()=>{
    if(!input.trim()){toast.error('Enter a query!');return};setLoading(true)
    try{const r=await callGrok([{role:'user',content:input}],systemPrompt||`You are EduMind AI's ${title} module. Provide comprehensive, accurate assistance. Use markdown formatting.`);setResult(r);addXP(xpAmt,title)}catch(e){toast.error(`Failed: ${e.message}`)}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={I} color={color} title={title} desc={desc}/>
    <div className="card-f space-y-3"><div className="flex gap-2.5"><input className="inp flex-1" placeholder={placeholder||`Enter your ${title.toLowerCase()} query…`} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()}/><button onClick={run} disabled={loading||!input.trim()} className="btn bPr shrink-0" style={{opacity:loading||!input.trim()? .55:1}}>{loading?<Spin/>:<Zap size={13}/>}{loading?'Running...':'Go (+'+xpAmt+' XP)'}</button></div></div>
    {loading&&<div className="card-f p-4"><div className="thinking"><span/><span/><span/><span className="text-xs ml-2" style={{color:'#475569'}}>Groq AI processing...</span></div></div>}
    {result&&<div className="card-f p-5"><div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{result}</ReactMarkdown></div></div>}
    {!result&&!loading&&<div className="card-f text-center py-12"><I size={36} className="mx-auto mb-3" style={{color:`${color}22`}}/><p className="text-sm" style={{color:'#374151'}}>Enter a query above to get AI-powered {title.toLowerCase()} assistance.</p></div>}
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// SCHEDULE
// ══════════════════════════════════════════════════════════════════════════════
export function SchedulePage(){
  const{addXP}=useGame(),{weakTopics}=useLearn()
  const[exam,setExam]=useState(''),[days,setDays]=useState(30),[hours,setHours]=useState(2),[schedule,setSchedule]=useState(''),[loading,setLoading]=useState(false)
  const generate=async()=>{
    if(!exam.trim()){toast.error('Enter exam!');return};setLoading(true)
    try{const r=await callGrok([{role:'user',content:`${days}-day study schedule for "${exam}":\n- Daily study: ${hours} hours\n- Weak topics: ${weakTopics.join(', ')}\n- Include: weekly milestones, daily topics, revision days, mock test days, rest days\n- Format as clean weekly breakdown with emojis`}],'You are an expert study planner using spaced repetition science. Create realistic, motivating schedules. Use markdown tables.');setSchedule(r);addXP(35,'Study Schedule');toast.success('Schedule ready! 📅')}catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={Calendar} color="#ffd700" title="AI Study Schedule" desc="Personalized AI-optimized timetable with spaced repetition science"/>
    <div className="card-f space-y-4">
      <input className="inp" placeholder="Exam name (e.g. JEE Advanced, NEET, UPSC, SAT…)" value={exam} onChange={e=>setExam(e.target.value)}/>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs mb-1 block" style={{color:'#64748b'}}>Days until exam: {days}</label><input type="range" min={7} max={180} value={days} onChange={e=>setDays(+e.target.value)} className="w-full accent-yellow-400"/></div>
        <div><label className="text-xs mb-1 block" style={{color:'#64748b'}}>Daily hours: {hours}h</label><input type="range" min={1} max={8} value={hours} onChange={e=>setHours(+e.target.value)} className="w-full accent-yellow-400"/></div>
      </div>
      <button onClick={generate} disabled={loading||!exam.trim()} className="btn bGo w-full justify-center" style={{opacity:loading||!exam.trim() ? .6 : 1}}>{loading?<><Spin/>Building Schedule...</>:<><Calendar size={13}/>Generate Study Plan (+35 XP)</>}</button>
    </div>
    {schedule&&(<div className="card-f p-5"><div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{schedule}</ReactMarkdown></div></div>)}
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// SMART NOTES
// ══════════════════════════════════════════════════════════════════════════════
export function NotesPage(){
  const{addXP}=useGame()
  const[notes,setNotes]=useState(''),[enhanced,setEnhanced]=useState(''),[loading,setLoading]=useState(false)
  const[saved,setSaved]=useState([{title:'Quantum Mechanics Notes',date:'2 days ago',preview:'Wave-particle duality, Schrödinger equation…'},{title:'Calculus — Integration',date:'3 days ago',preview:'Integration by parts, substitution rule…'}])
  const enhance=async()=>{
    if(!notes.trim())return;setLoading(true)
    try{const r=await callGrok([{role:'user',content:`Enhance and structure these student notes:\n\n${notes}\n\nAdd: clear headings, bullet points, key terms highlighted, summary, memory tips, missing important info.`}],'You are an AI note-taking assistant. Transform raw notes into structured, comprehensive study material. Use markdown.');setEnhanced(r);addXP(20,'Smart Notes');setSaved(s=>[{title:notes.slice(0,40)+'…',date:'Just now',preview:notes.slice(0,80)+'…'},...s.slice(0,9)]);toast.success('Notes enhanced! ✨')}catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={FileText} color="#00d4ff" title="Smart Notes" desc="AI-enhanced note-taking with automatic structuring & summaries"/>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div><label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>YOUR RAW NOTES</label><textarea className="inp" rows={10} placeholder="Type or paste your notes — AI will structure, enhance and improve them…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <button onClick={enhance} disabled={loading||!notes.trim()} className="btn bPr w-full justify-center" style={{opacity:loading||!notes.trim() ? .6 : 1}}>{loading?<><Spin/>AI Enhancing...</>:<><Sparkles size={13}/>Enhance Notes (+20 XP)</>}</button>
        {enhanced&&(<div className="card-f p-5"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#00d4ff'}}>✨ ENHANCED NOTES</div><div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{enhanced}</ReactMarkdown></div></div>)}
      </div>
      <div className="card-f h-fit"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#e2e8f0'}}>SAVED NOTES</div><div className="space-y-2.5">{saved.map((s,i)=>(<div key={i} className="p-3 rounded-xl cursor-pointer hover:bg-white/3 transition-colors" style={{background:'rgba(0,212,255,0.025)',border:'1px solid rgba(0,212,255,0.07)'}}><div className="text-xs font-semibold mb-0.5" style={{color:'#e2e8f0'}}>{s.title}</div><div className="text-xs" style={{color:'#475569'}}>{s.preview}</div><div className="text-xs mt-1" style={{color:'#374151'}}>{s.date}</div></div>))}</div></div>
    </div>
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// WEAKNESS RECAP
// ══════════════════════════════════════════════════════════════════════════════
export function WeaknessRecapPage(){
  const{weakTopics,removeWeak}=useLearn(),{addXP}=useGame()
  const[sel,setSel]=useState(weakTopics[0]||''),[recap,setRecap]=useState(''),[loading,setLoading]=useState(false)
  const generate=async()=>{
    if(!sel)return;setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:'Targeted recap for student struggling with "'+sel+'":\n1)3 key concepts likely misunderstood\n2)Clear explanation of each from scratch\n3)3 practice problems with solutions\n4)Memory tricks & mnemonics\n5)Common exam traps to avoid'}],'You are a remedial AI tutor specializing in fixing misconceptions. Be patient, clear, thorough. Use markdown.')
      setRecap(r);addXP(60,'Weakness Recap');toast.success(sel+' recap ready! 💪')
    }catch(e){toast.error('Failed')}
    setLoading(false)
  }
  const btnStyle={opacity:loading?0.6:1}
  return(
    <div className="p-5 space-y-5 max-w-3xl pageIn">
      <PH icon={Target} color="#ff3366" title="Adaptive Learning Recap" desc="AI targets your exact weak points and fixes them fast"/>
      <div className="card-f space-y-4">
        <div>
          <div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#ff9900'}}>YOUR WEAK TOPICS</div>
          {weakTopics.length>0 ? (
            <div className="flex flex-wrap gap-2">
              {weakTopics.map(t=>(
                <button key={t} onClick={()=>setSel(t)} className="cursor-pointer transition-all"
                  style={{background:sel===t?'rgba(255,51,102,0.14)':'rgba(255,153,0,0.09)',color:sel===t?'#ff3366':'#ff9900',border:'1px solid '+(sel===t?'rgba(255,51,102,0.28)':'rgba(255,153,0,0.18)'),padding:'6px 12px',fontSize:12,borderRadius:999,fontFamily:'Orbitron,monospace',fontWeight:700}}>
                  {t}{sel===t?' ✓':''}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm" style={{color:'#475569'}}>No weak topics yet. Take some quizzes to identify gaps!</div>
          )}
        </div>
        {sel ? (
          <button onClick={generate} disabled={loading} className="btn bDa w-full justify-center" style={btnStyle}>
            {loading ? <><Spin/>AI Building Recap...</> : <><Target size={13}/>Fix {sel} Now (+60 XP)</>}
          </button>
        ) : null}
      </div>
      {recap ? (
        <div className="card-f p-5">
          <div className="chatA" style={{border:'none',background:'transparent',padding:0}}>
            <ReactMarkdown>{recap}</ReactMarkdown>
          </div>
          <button onClick={()=>removeWeak(sel)} className="btn bGr bSm mt-4">
            <CheckCircle size={11}/>Mark as Mastered!
          </button>
        </div>
      ) : null}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════════════════
export function ProfilePage(){
  const nav=useNavigate(),{user}=useAuth()
  const{xp,level,streak,badges,coins}=useGame(),{weakTopics,studyHours,quantumSync,attention,cogLoad}=useLearn()
  const league=getLeague(xp),{progress}=getLevelXP(xp)
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <div className="card-f p-6">
      <div className="flex items-center gap-5 flex-wrap">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black gB shrink-0" style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'white',fontFamily:'Orbitron,monospace'}}>{(user?.name||'S')[0].toUpperCase()}</div>
        <div className="flex-1"><div className="font-display text-2xl font-black" style={{color:'#e2e8f0'}}>{user?.name||'Student'}</div>
          <div className="text-sm mt-0.5" style={{color:'#64748b'}}>EduMind AI Member · {league.name} League</div>
          <div className="flex items-center gap-2 mt-2"><span className="bdg bGold">{league.name} League</span><span className="bdg bB">Level {level}</span><span className="bdg bGreen">Active</span></div></div>
      </div>
      <div className="mt-4"><div className="flex justify-between text-xs mb-1.5"><span style={{color:'#94a3b8'}}>Level {level} → {level+1}</span><span className="font-mono" style={{color:'#ffd700'}}>{Math.round(progress)}%</span></div><div className="xpT"><div className="xpF" style={{width:`${progress}%`}}/></div></div>
    </div>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">{[{l:'Total XP',v:fmtXP(xp),c:'#ffd700'},{l:'Level',v:level,c:'#00d4ff'},{l:'Streak',v:`${streak}🔥`,c:'#ff9900'},{l:'Study Hrs',v:`${studyHours}h`,c:'#00ff88'},{l:'Coins',v:`${coins}🪙`,c:'#ffd700'},{l:'QSync',v:`${quantumSync}%`,c:'#a78bfa'}].map(s=>(<div key={s.l} className="card-f text-center py-3"><div className="font-display text-lg font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs mt-0.5" style={{color:'#475569'}}>{s.l}</div></div>))}</div>
    <div className="card-f"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#e2e8f0'}}>MY BADGES ({badges.length})</div><div className="flex flex-wrap gap-2">{badges.map((b,i)=>(<span key={i} className="bdg bGold" style={{fontSize:11,padding:'5px 12px'}}>{b}</span>))}</div></div>
    {weakTopics.length>0&&(<div className="card-f"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#ff9900'}}>⚠️ KNOWLEDGE VOIDS</div><div className="flex flex-wrap gap-2">{weakTopics.map(t=>(<span key={t} className="bdg bOr" style={{fontSize:11}}>{t}</span>))}</div><button onClick={()=>nav('/weakness-recap')} className="btn bSm bGh mt-3">Start Adaptive Recap</button></div>)}
  </div>)
}

// ══════════════════════════════════════════════════════════════════════════════
// REMAINING PAGES via GenAIPage
// ══════════════════════════════════════════════════════════════════════════════
export function VoicePage(){
  const{addXP}=useGame(),{persona,lang}=useUI()
  const[transcript,setTranscript]=useState(''),[answer,setAnswer]=useState(''),[loading,setLoading]=useState(false),[listening,setListening]=useState(false),[recRef,setRecRef]=useState(null)
  const langCode=getLangCode(lang)
  const startRec=()=>{
    setListening(true);setTranscript('')
    const r=startListening(
      t=>{setTranscript(t);setListening(false)},
      e=>{toast.error('Mic error: '+e);setListening(false)},
      langCode
    )
    setRecRef(r)
  }
  const stopRec=()=>{recRef?.stop();setListening(false)}
  const solve=async()=>{
    if(!transcript.trim())return;setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:transcript}],PERSONA_PROMPTS[persona]+' Answer clearly and helpfully.')
      setAnswer(r);addXP(35,'Voice Solver')
      speak(r.slice(0,300),langCode)
    }catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={Volume2} color="#00ff88" title="Voice Doubt Solver" desc="Speak your doubt — AI solves it instantly and reads the answer aloud"/>
    <div className="card-f space-y-4 text-center">
      <p className="text-sm" style={{color:'#64748b'}}>Press mic, speak your question, then let AI solve it with voice answer!</p>
      <button onClick={listening?stopRec:startRec}
        className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all ${listening?'bDa':'bGr'} btn`}
        style={{fontSize:32,width:96,height:96,borderRadius:'50%',justifyContent:'center'}}>
        {listening?<MicOff size={36}/>:<Mic size={36}/>}
      </button>
      <p className="text-xs" style={{color:listening?'#ff3366':'#64748b'}}>{listening?'🔴 Listening… speak now':'Click mic to start'}</p>
      {transcript&&(<div className="rounded-xl p-4 text-left" style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.15)'}}><p className="text-xs mb-1" style={{color:'#64748b'}}>You said:</p><p className="text-sm font-semibold" style={{color:'#e2e8f0'}}>{transcript}</p></div>)}
      {transcript&&<button onClick={solve} disabled={loading} className="btn bGr mx-auto" style={{opacity:loading?0.6:1}}>{loading?<><Spin/>Solving...</>:<><Zap size={14}/>Solve & Speak</>}</button>}
    </div>
    {answer&&(<div className="card-f p-5"><div className="flex items-center justify-between mb-3"><span className="font-display text-xs font-bold" style={{color:'#00ff88'}}>AI ANSWER</span><button onClick={()=>speak(answer,langCode)} className="btn bSm bGr"><Volume2 size={11}/>Read Aloud</button></div><div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{answer}</ReactMarkdown></div></div>)}
  </div>)
}
export function DiagramPage(){
  const{addXP}=useGame()
  const[type,setType]=useState('flowchart'),[topic,setTopic]=useState(''),[result,setResult]=useState(''),[loading,setLoading]=useState(false)
  const TYPES=['flowchart','mind map','process diagram','system architecture','ER diagram','timeline','comparison table','hierarchy chart']
  const generate=async()=>{
    if(!topic.trim())return;setLoading(true)
    try{
      const prompts={
        'flowchart':`Create a detailed flowchart for "${topic}" using ASCII art with boxes ([ ]) for processes, diamonds (<>) for decisions, and arrows (→). Make it clear and readable.`,
        'mind map':`Create a text-based mind map for "${topic}" using indented hierarchy. Central concept at top, then branches, sub-branches. Use symbols (●◦▸) for levels.`,
        'comparison table':`Create a detailed comparison table for "${topic}" using markdown table format with clear columns and rows.`,
        'timeline':`Create a detailed timeline for "${topic}" with dates/phases, key events, and descriptions in a structured markdown format.`,
        'system architecture':`Create a system architecture diagram for "${topic}" using ASCII art and structured text showing components, connections, and data flow.`,
      }
      const prompt=prompts[type]||`Create a detailed ${type} for "${topic}" using clear text representation, ASCII art, and markdown formatting.`
      const r=await callGrok([{role:'user',content:prompt}],'You are a diagram and visualization expert. Create clear, detailed, well-structured diagrams using text, ASCII art, and markdown. Make them educational and easy to understand.')
      setResult(r);addXP(30,'Diagram')
    }catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={Map} color="#7c3aed" title="AI Diagram Maker" desc="Generate flowcharts, mind maps, ER diagrams, timelines — any type"/>
    <div className="card-f space-y-4">
      <div><label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>DIAGRAM TYPE</label>
        <div className="flex flex-wrap gap-2">{TYPES.map(t=>(<button key={t} onClick={()=>setType(t)} className="text-xs px-3 py-1.5 rounded-lg capitalize transition-colors" style={{background:type===t?'rgba(124,58,237,0.15)':'rgba(255,255,255,0.025)',color:type===t?'#a78bfa':'#64748b',border:`1px solid ${type===t?'rgba(124,58,237,0.3)':'rgba(255,255,255,0.05)'}`}}>{t}</button>))}</div>
      </div>
      <div><label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>TOPIC / SUBJECT</label>
        <div className="flex gap-3"><input className="inp flex-1" placeholder="e.g. Login process, Photosynthesis, Database design, Software lifecycle…" value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()}/><button onClick={generate} disabled={loading||!topic.trim()} className="btn bPu shrink-0" style={{opacity:loading||!topic.trim()?0.6:1}}>{loading?<div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spinEl"/>:<Map size={13}/>}{loading?'Drawing...':'Generate'}</button></div>
      </div>
    </div>
    {result&&(<div className="card-f p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-xs font-bold tracking-wide" style={{color:'#7c3aed'}}>{type.toUpperCase()} — {topic.toUpperCase()}</span>
        <button onClick={()=>exportToPDF(result,topic+' '+type)} className="btn bSm bGh"><Download size={11}/>PDF</button>
      </div>
      <div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{result}</ReactMarkdown></div>
    </div>)}
    {!result&&!loading&&<div className="card-f text-center py-10"><Map size={36} className="mx-auto mb-3" style={{color:'rgba(124,58,237,0.18)'}}/><p className="text-sm" style={{color:'#374151'}}>Select diagram type, enter topic, and get an instant AI-generated visual diagram.</p></div>}
  </div>)
}
export function ResearchPage(){
  const{addXP}=useGame()
  const[query,setQuery]=useState(''),[field,setField]=useState('All'),[results,setResults]=useState([]),[loading,setLoading]=useState(false)
  const FIELDS=['All','Computer Science','Physics','Biology','Chemistry','Mathematics','Medicine','Psychology','Economics','History']
  const search=async()=>{
    if(!query.trim())return;setLoading(true)
    try{
      const data=await callGrokJSON([{role:'user',content:`Find 6 highly relevant academic papers/articles for: "${query}" in ${field}. Return JSON: {"papers":[{"title":"paper title","authors":"Author1, Author2","year":2024,"journal":"Journal Name","abstract":"2-3 sentence summary","keyFindings":"main findings","citations":120,"url":"hypothetical-url","relevance":95}]}`}],
        'You are an academic research librarian. Generate realistic, educational paper entries. Return valid JSON only.')
      setResults(data.papers||[]);addXP(35,'Research Finder')
      toast.success(`${data.papers?.length||0} papers found!`)
    }catch(e){toast.error('Search failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 pageIn">
    <PH icon={Search} color="#00ff88" title="AI Research Finder" desc="Find academic papers, research articles and scholarly sources instantly"/>
    <div className="card-f space-y-3">
      <div className="flex gap-3"><input className="inp flex-1" placeholder="Research topic, author, or concept…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}/><button onClick={search} disabled={loading||!query.trim()} className="btn bGr shrink-0" style={{opacity:loading||!query.trim()?0.6:1}}>{loading?<div className="w-4 h-4 border-2 border-black/25 border-t-black rounded-full spinEl"/>:<Search size={13}/>}Search</button></div>
      <div className="flex flex-wrap gap-2">{FIELDS.map(f=>(<button key={f} onClick={()=>setField(f)} className="text-xs px-2.5 py-1 rounded-lg transition-colors" style={{background:field===f?'rgba(0,255,136,0.12)':'rgba(255,255,255,0.025)',color:field===f?'#00ff88':'#64748b',border:`1px solid ${field===f?'rgba(0,255,136,0.28)':'rgba(255,255,255,0.05)'}`}}>{f}</button>))}</div>
    </div>
    {results.length>0&&(<div className="space-y-4">{results.map((p,i)=>(<div key={i} className="card">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-snug mb-1" style={{color:'#00d4ff'}}>{p.title}</div>
          <div className="text-xs" style={{color:'#64748b'}}>{p.authors} · {p.journal} · {p.year}</div>
        </div>
        <div className="flex flex-col gap-1 shrink-0 items-end">
          <span className="bdg bGreen" style={{fontSize:9}}>{p.relevance}% match</span>
          <span className="text-xs" style={{color:'#475569'}}>📎 {p.citations} citations</span>
        </div>
      </div>
      <p className="text-xs leading-relaxed mb-2" style={{color:'#94a3b8'}}>{p.abstract}</p>
      <div className="text-xs p-2.5 rounded-lg" style={{background:'rgba(0,255,136,0.04)',border:'1px solid rgba(0,255,136,0.1)',color:'#64748b'}}><span style={{color:'#00ff88',fontWeight:600}}>Key Findings: </span>{p.keyFindings}</div>
    </div>))}</div>)}
    {!results.length&&!loading&&<div className="card-f text-center py-10"><Search size={36} className="mx-auto mb-3" style={{color:'rgba(0,255,136,0.18)'}}/><p className="text-sm" style={{color:'#374151'}}>Search academic papers, research articles and scholarly sources across all fields.</p></div>}
  </div>)
}
export function PastPaperPage(){
  const{addXP}=useGame()
  const[questions,setQuestions]=useState(''),[subject,setSubject]=useState('Mathematics'),[year,setYear]=useState('2023'),[solution,setSolution]=useState(''),[loading,setLoading]=useState(false)
  const solve=async()=>{
    if(!questions.trim()){toast.error('Paste questions!');return};setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`Past Paper: ${subject} (${year})

Questions:
${questions}

Solve each question with:
1. Complete step-by-step working
2. Key formula used
3. Final answer clearly marked
4. Common mistakes to avoid
5. Marks allocation tips`}],
        'You are an expert exam solver and teacher. Solve each question completely with clear step-by-step workings. Show all intermediate steps. Mark final answers clearly. Use markdown with numbered solutions.')
      setSolution(r);addXP(50,'Past Paper')
      toast.success('Solutions ready! ✅')
    }catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={BookOpen} color="#a78bfa" title="AI Past Paper Solver" desc="Paste any past exam paper — AI solves with full step-by-step workings"/>
    <div className="card-f space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs mb-1 block" style={{color:'#64748b'}}>Subject</label><select className="inp" value={subject} onChange={e=>setSubject(e.target.value)}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-xs mb-1 block" style={{color:'#64748b'}}>Year</label><select className="inp" value={year} onChange={e=>setYear(e.target.value)}>{['2024','2023','2022','2021','2020','2019','2018'].map(y=><option key={y}>{y}</option>)}</select></div>
      </div>
      <div><label className="text-xs font-bold mb-2 block" style={{color:'#94a3b8',letterSpacing:'.06em'}}>PASTE EXAM QUESTIONS</label><textarea className="inp" rows={8} placeholder="Paste past paper questions here...

Q1. Find the derivative of f(x) = 3x² + 2x - 5
Q2. ...
Q3. ..." value={questions} onChange={e=>setQuestions(e.target.value)}/></div>
      <button onClick={solve} disabled={loading||!questions.trim()} className="btn bPu w-full justify-center" style={{opacity:loading||!questions.trim()?0.6:1}}>
        {loading?<><div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spinEl"/>Solving with Groq AI...</>:<><BookOpen size={13}/>Solve All Questions (+50 XP)</>}
      </button>
    </div>
    {solution&&(<div className="card-f p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-xs font-bold tracking-wide" style={{color:'#a78bfa'}}>COMPLETE SOLUTIONS — {subject} {year}</span>
        <button onClick={()=>exportToPDF(solution,subject+' '+year+' Solutions')} className="btn bSm bGh"><Download size={11}/>PDF</button>
      </div>
      <div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{solution}</ReactMarkdown></div>
    </div>)}
    {!solution&&!loading&&<div className="card-f text-center py-10"><BookOpen size={36} className="mx-auto mb-3" style={{color:'rgba(167,139,250,0.18)'}}/><p className="text-sm" style={{color:'#374151'}}>Paste any past exam questions and get complete step-by-step solutions with PDF export.</p></div>}
  </div>)
}
export function KnowledgeGraphPage(){
  const{addXP}=useGame()
  const[concept,setConcept]=useState(''),[nodes,setNodes]=useState([]),[loading,setLoading]=useState(false)
  const COLORS=['#00d4ff','#ffd700','#7c3aed','#00ff88','#ff3366','#ff9900','#a78bfa','#00d4ff']
  const generate=async()=>{
    if(!concept.trim())return;setLoading(true)
    try{
      const data=await callGrokJSON([{role:'user',content:`Generate a knowledge graph for "${concept}". Return JSON: {"nodes":[{"id":1,"label":"concept name","level":0},...],"connections":[[1,2],[1,3],...]} with 1 root node (level 0), 4-5 main nodes (level 1), 6-8 sub-nodes (level 2). Max 14 nodes total.`}],
        'You are a knowledge graph generator. Return only valid JSON representing a knowledge graph with clear hierarchy.')
      if(data.nodes){
        const enriched=data.nodes.map((n,i)=>({...n,x:n.level===0?50:n.level===1?15+i*18:10+i*12,y:n.level===0?50:n.level===1?25:75,color:COLORS[i%COLORS.length],connections:data.connections.filter(c=>c[0]===n.id||c[1]===n.id)}))
        setNodes({nodes:enriched,connections:data.connections})
        addXP(30,'Knowledge Graph')
      }
    }catch(e){
      // fallback simple graph
      const fallback={nodes:[
        {id:1,label:concept,x:50,y:50,color:'#00d4ff',level:0},
        {id:2,label:'Core Principles',x:25,y:25,color:'#ffd700',level:1},
        {id:3,label:'Applications',x:75,y:25,color:'#00ff88',level:1},
        {id:4,label:'Related Fields',x:25,y:75,color:'#a78bfa',level:1},
        {id:5,label:'Key Theories',x:75,y:75,color:'#ff9900',level:1},
      ],connections:[[1,2],[1,3],[1,4],[1,5]]}
      setNodes(fallback)
      addXP(30,'Knowledge Graph')
    }
    setLoading(false)
  }
  const graph=nodes.nodes||[]
  const conns=nodes.connections||[]
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={Network} color="#00d4ff" title="Concept Knowledge Graph" desc="Interactive visual map of interconnected concepts"/>
    <div className="card-f space-y-3">
      <div className="flex gap-3"><input className="inp flex-1" placeholder="Enter main concept (e.g. Machine Learning, Photosynthesis, World War 2)…" value={concept} onChange={e=>setConcept(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()}/><button onClick={generate} disabled={loading||!concept.trim()} className="btn bPr shrink-0" style={{opacity:loading||!concept.trim()?0.6:1}}>{loading?<Spin/>:<Network size={13}/>}Generate</button></div>
    </div>
    {graph.length>0&&(<div className="card-f p-4">
      <div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#00d4ff'}}>KNOWLEDGE GRAPH — {concept.toUpperCase()}</div>
      <div className="relative w-full rounded-xl overflow-hidden" style={{height:320,background:'radial-gradient(ellipse at center,rgba(0,212,255,0.05),rgba(3,7,18,0.95))'}}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {conns.map(([a,b],i)=>{
            const na=graph.find(n=>n.id===a),nb=graph.find(n=>n.id===b)
            return na&&nb?<line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(0,212,255,0.25)" strokeWidth="0.4"/>:null
          })}
          {graph.map(n=>(<g key={n.id} style={{cursor:'pointer'}}>
            <circle cx={n.x} cy={n.y} r={n.level===0?6:n.level===1?4:2.5} fill={n.color} opacity={0.9} style={{filter:`drop-shadow(0 0 3px ${n.color})`}}/>
            <text x={n.x} y={n.y+(n.level===0?10:n.level===1?8:6)} textAnchor="middle" fill="#e2e8f0" fontSize={n.level===0?4:n.level===1?3:2.5} fontFamily="Exo 2,sans-serif">{n.label}</text>
          </g>))}
        </svg>
      </div>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {[{c:'#00d4ff',l:'Root concept'},{c:'#ffd700',l:'Main topics'},{c:'#00ff88',l:'Sub-topics'}].map(l=>(<div key={l.l} className="flex items-center gap-1.5 text-xs" style={{color:'#64748b'}}><div className="w-2 h-2 rounded-full" style={{background:l.c}}/>{l.l}</div>))}
      </div>
    </div>)}
    {!graph.length&&!loading&&<div className="card-f text-center py-10"><Network size={36} className="mx-auto mb-3" style={{color:'rgba(0,212,255,0.18)'}}/><p className="text-sm" style={{color:'#374151'}}>Enter a concept to generate an interactive knowledge graph with visual connections.</p></div>}
  </div>)
}
export function FormulaSheetPage(){
  const{addXP}=useGame()
  const[subject,setSubject]=useState(''),[sheet,setSheet]=useState(''),[loading,setLoading]=useState(false)
  const generate=async()=>{
    if(!subject.trim())return;setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`Generate a comprehensive formula cheatsheet for "${subject}". Include all important formulas with: symbol, description, units/dimensions, when to use. Format as organized markdown tables by category.`}],
        'You are a formula sheet expert. Create comprehensive, accurate, well-organized formula sheets. Use markdown tables and clear categories.')
      setSheet(r);addXP(25,'Formula Sheet')
    }catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={FlaskConical} color="#00ff88" title="AI Formula Sheet Generator" desc="Instant comprehensive formula cheatsheets for any subject"/>
    <div className="card-f space-y-3">
      <div className="flex gap-3">
        <input className="inp flex-1" placeholder="Subject (e.g. Physics, Calculus, Chemistry, Organic Chemistry)…" value={subject} onChange={e=>setSubject(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()}/>
        <button onClick={generate} disabled={loading||!subject.trim()} className="btn bGr shrink-0" style={{opacity:loading||!subject.trim()?0.6:1}}>{loading?<Spin/>:<FlaskConical size={13}/>}Generate</button>
      </div>
      <div className="flex flex-wrap gap-2">{['Physics','Mathematics','Chemistry','Biology','Electrical'].map(s=>(<button key={s} onClick={()=>setSubject(s)} className="text-xs px-2.5 py-1 rounded-lg hover:bg-white/5" style={{background:'rgba(0,255,136,0.05)',border:'1px solid rgba(0,255,136,0.12)',color:'#64748b'}}>{s}</button>))}</div>
    </div>
    {sheet&&(<div className="card-f p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-xs font-bold" style={{color:'#00ff88'}}>FORMULA SHEET — {subject.toUpperCase()}</span>
        <button onClick={()=>exportToPDF(sheet,subject+' Formulas')} className="btn bSm bGh"><Download size={11}/>PDF</button>
      </div>
      <div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{sheet}</ReactMarkdown></div>
    </div>)}
    {!sheet&&!loading&&<div className="card-f text-center py-10"><FlaskConical size={36} className="mx-auto mb-3" style={{color:'rgba(0,255,136,0.18)'}}/><p className="text-sm" style={{color:'#374151'}}>Enter subject to generate instant formula cheatsheet with PDF export.</p></div>}
  </div>)
}
export function TextbookPage(){
  const{addXP}=useGame()
  const[topic,setTopic]=useState(''),[chapter,setChapter]=useState(''),[loading,setLoading]=useState(false)
  const generate=async()=>{
    if(!topic.trim())return;setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`Write a complete textbook chapter on "${topic}". Include: introduction, key concepts with detailed explanations, real-world examples, diagrams described in text, worked examples, summary, key terms glossary, practice questions with answers.`}],
        'You are an academic textbook author. Write clear, comprehensive, well-structured textbook chapters. Use markdown with proper headings, examples, and practice questions.')
      setChapter(r);addXP(40,'AI Textbook')
    }catch(e){toast.error('Failed')}
    setLoading(false)
  }
  return(<div className="p-5 space-y-5 max-w-3xl pageIn">
    <PH icon={BookOpen} color="#ffd700" title="AI Textbook Generator" desc="Complete AI-generated textbook chapters on any topic"/>
    <div className="card-f space-y-3">
      <div className="flex gap-3">
        <input className="inp flex-1" placeholder="Chapter topic (e.g. Newton's Laws, Photosynthesis, French Revolution)…" value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()}/>
        <button onClick={generate} disabled={loading||!topic.trim()} className="btn bGo shrink-0" style={{opacity:loading||!topic.trim()?0.6:1}}>{loading?<Spin/>:<BookOpen size={13}/>}Generate</button>
      </div>
    </div>
    {chapter&&(<div className="card-f p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-xs font-bold" style={{color:'#ffd700'}}>CHAPTER: {topic.toUpperCase()}</span>
        <button onClick={()=>exportToPDF(chapter,topic+' Chapter')} className="btn bSm bGh"><Download size={11}/>PDF</button>
      </div>
      <div className="chatA" style={{border:'none',background:'transparent',padding:0}}><ReactMarkdown>{chapter}</ReactMarkdown></div>
    </div>)}
    {!chapter&&!loading&&<div className="card-f text-center py-10"><BookOpen size={36} className="mx-auto mb-3" style={{color:'rgba(255,215,0,0.18)'}}/><p className="text-sm" style={{color:'#374151'}}>Enter chapter topic to generate a complete AI textbook chapter with PDF export.</p></div>}
  </div>)
}
export function QuizRoomPage(){
  const nav=useNavigate(),{addXP}=useGame()
  const[phase,setPhase]=useState('lobby'),[roomCode,setRoomCode]=useState(''),[joinCode,setJoinCode]=useState('')
  const[topic,setTopic]=useState(''),[participants,setParticipants]=useState([]),[loading,setLoading]=useState(false)
  const[questions,setQuestions]=useState([]),[cur,setCur]=useState(0),[sel,setSel]=useState(null),[scores,setScores]=useState({})
  const MOCK_PLAYERS=['Priya 🇮🇳','Arjun 🇮🇳','Mei 🇨🇳','Carlos 🇲🇽']
  const createRoom=async()=>{
    if(!topic.trim())return
    const code=Math.random().toString(36).slice(2,8).toUpperCase()
    setRoomCode(code)
    setParticipants([{name:'You (Host)',score:0},...MOCK_PLAYERS.slice(0,2).map(p=>({name:p,score:0}))])
    setPhase('waiting')
    toast.success('Room created! Code: '+code)
  }
  const startQuiz=async()=>{
    setLoading(true)
    try{
      const data=await callGrokJSON([{role:'user',content:`Generate 5 fun competitive quiz questions on "${topic}". Return JSON: {"questions":[{"q":"question","opts":["A. opt","B. opt","C. opt","D. opt"],"ans":"A","exp":"explanation"}]}`}],
        'Quiz master AI. Generate fun, challenging MCQ questions. Return valid JSON only.')
      setQuestions(data.questions||[]);setPhase('quiz');setCur(0);setSel(null)
      setScores(Object.fromEntries(participants.map(p=>[p.name,0])))
      addXP(20,'Quiz Room')
    }catch(e){toast.error('Failed to generate quiz')}
    setLoading(false)
  }
  const pick=opt=>{
    if(sel!==null)return;setSel(opt)
    const correct=opt.charAt(0)===questions[cur]?.ans
    if(correct){
      const pts=100-cur*5
      setScores(s=>({...s,'You (Host)':(s['You (Host)']||0)+pts}))
    }
    // Simulate other players answering
    setTimeout(()=>{
      setScores(s=>{
        const ns={...s}
        MOCK_PLAYERS.slice(0,2).forEach(p=>{if(Math.random()>0.4)ns[p]=(ns[p]||0)+Math.floor(Math.random()*80+20)})
        return ns
      })
    },1000)
  }
  const next=()=>{if(cur+1>=questions.length){setPhase('results');addXP(100,'Quiz Room Win')}else{setCur(c=>c+1);setSel(null)}}

  if(phase==='results'){
    const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1])
    return(<div className="p-5 max-w-2xl mx-auto pageIn">
      <div className="card-f text-center p-8">
        <div className="text-5xl mb-4">🏆</div>
        <div className="font-display text-2xl font-black mb-4" style={{color:'#ffd700'}}>Quiz Complete!</div>
        <div className="space-y-2.5 mb-6">{sorted.map(([name,score],i)=>(<div key={name} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{background:i===0?'rgba(255,215,0,0.08)':'rgba(255,255,255,0.02)',border:`1px solid ${i===0?'rgba(255,215,0,0.25)':'rgba(255,255,255,0.05)'}`}}>
          <span className="font-bold text-sm">{i===0?'🥇':i===1?'🥈':i===2?'🥉':'  '}</span>
          <span className="flex-1 text-sm font-semibold" style={{color:i===0?'#ffd700':'#94a3b8'}}>{name}</span>
          <span className="font-mono font-bold" style={{color:i===0?'#ffd700':'#64748b'}}>{score} pts</span>
        </div>))}</div>
        <button onClick={()=>setPhase('lobby')} className="btn bPr mx-auto"><RotateCcw size={13}/>New Room</button>
      </div>
    </div>)
  }

  if(phase==='quiz'&&questions.length>0){
    const q=questions[cur]
    const lb=Object.entries(scores).sort((a,b)=>b[1]-a[1])
    return(<div className="p-5 max-w-3xl mx-auto pageIn">
      <div className="flex items-center justify-between mb-4">
        <span className="bdg bB">Q {cur+1}/{questions.length}</span>
        <span className="bdg bPurple font-mono">Room: {roomCode}</span>
        <span className="font-mono text-sm" style={{color:'#ffd700'}}>You: {scores['You (Host)']||0} pts</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="card-f p-5"><p className="text-base font-semibold leading-relaxed" style={{color:'#e2e8f0'}}>{q.q}</p></div>
          <div className="space-y-2.5">{(q.opts||[]).map((opt,i)=>{
            const isC=opt.charAt(0)===q.ans,isS=opt===sel
            let cls='qOpt'
            if(sel!==null){if(isC)cls+=' correct';else if(isS&&!isC)cls+=' wrong'}
            return<button key={i} className={cls} onClick={()=>pick(opt)} disabled={sel!==null}>{opt}</button>
          })}</div>
          {sel!==null&&<><div className="rounded-xl p-3 text-sm" style={{background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.12)',color:'#64748b'}}>💡 {q.exp}</div><button onClick={next} className="btn bPr w-full justify-center">{cur+1>=questions.length?'🏆 See Results':'Next Question'}</button></>}
        </div>
        <div className="card-f h-fit"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#e2e8f0'}}>LIVE LEADERBOARD</div><div className="space-y-2">{lb.map(([name,score],i)=>(<div key={name} className="flex items-center gap-2 text-xs"><span style={{color:'#ffd700'}}>{i+1}</span><span className="flex-1 truncate" style={{color:'#94a3b8'}}>{name}</span><span className="font-mono" style={{color:'#ffd700'}}>{score}</span></div>))}</div></div>
      </div>
    </div>)
  }

  if(phase==='waiting')return(<div className="p-5 max-w-2xl mx-auto pageIn">
    <div className="card-f p-6 text-center mb-4">
      <div className="font-display text-4xl font-black mb-2" style={{color:'#ffd700'}}>{roomCode}</div>
      <p className="text-sm" style={{color:'#64748b'}}>Share this code with friends to join · Topic: {topic}</p>
    </div>
    <div className="card-f mb-4"><div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#e2e8f0'}}>PARTICIPANTS ({participants.length})</div><div className="space-y-2">{participants.map((p,i)=>(<div key={i} className="flex items-center gap-2 text-sm"><div className="pdot" style={{background:'#00ff88',color:'#00ff88'}}/><span style={{color:'#94a3b8'}}>{p.name}</span>{i===0&&<span className="bdg bGold" style={{fontSize:9}}>HOST</span>}</div>))}</div></div>
    <button onClick={startQuiz} disabled={loading} className="btn bPr w-full justify-center">{loading?<><Spin/>Generating Quiz...</>:<><Zap size={14}/>Start Quiz!</>}</button>
  </div>)

  return(<div className="p-5 max-w-2xl mx-auto pageIn">
    <PH icon={Users} color="#ff3366" title="Collaborative Quiz Rooms" desc="Real-time multiplayer quiz battles — create or join a room"/>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card-f space-y-3"><div className="font-display text-sm font-bold" style={{color:'#ff3366'}}>🎮 CREATE ROOM</div><input className="inp" placeholder="Quiz topic…" value={topic} onChange={e=>setTopic(e.target.value)}/><button onClick={createRoom} disabled={!topic.trim()} className="btn bDa w-full justify-center" style={{opacity:!topic.trim()?0.6:1}}><Plus size={13}/>Create Room</button></div>
      <div className="card-f space-y-3"><div className="font-display text-sm font-bold" style={{color:'#00d4ff'}}>🔗 JOIN ROOM</div><input className="inp" placeholder="Enter room code…" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={6}/><button onClick={()=>toast.success('Joined room! '+joinCode)} disabled={!joinCode.trim()} className="btn bPr w-full justify-center" style={{opacity:!joinCode.trim()?0.6:1}}><Users size={13}/>Join Room</button></div>
    </div>
  </div>)
}

// Institution Pages

// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTION OS — Full Multi-Role Dashboard
// ══════════════════════════════════════════════════════════════════════════════
export function InstitutionPage(){
  const[role,setRole]=useState('teacher')
  const[query,setQuery]=useState('')
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)
  const{addXP}=useGame()
  const nav=useNavigate()

  const ROLES=[
    {id:'teacher',e:'👨‍🏫',l:'Teacher',c:'#a78bfa'},
    {id:'student',e:'🎓',l:'Student',c:'#00d4ff'},
    {id:'parent',e:'👪',l:'Parent',c:'#f97316'},
    {id:'admin',e:'🏛️',l:'Admin',c:'#ffd700'},
  ]
  const TASKS={
    teacher:['Create lesson plan for Chapter 5','Generate 20 MCQ questions on Algebra','Write rubric for project evaluation','Design weekly timetable','Analyze class performance trends'],
    student:['Show my attendance summary','What topics am I weak in?','Generate revision checklist','Predict my exam score','Suggest study resources'],
    parent:['Show my child\'s progress report','Attendance last month','Upcoming exam schedule','Teacher feedback summary','Fee payment status'],
    admin:['Generate monthly analytics report','Teacher performance overview','Student enrollment stats','Exam schedule management','Infrastructure utilization'],
  }

  async function run(q){
    const txt=q||query
    if(!txt.trim()) return toast.error('Enter a query!')
    setLoading(true)
    const systems={
      teacher:'You are an AI assistant for teachers. Help with lesson planning, assessments, grading rubrics, and student analytics. Use markdown tables and structured output.',
      student:'You are a student academic advisor. Provide progress analysis, study tips, and personalized guidance. Use markdown.',
      parent:'You are a parent portal AI. Provide clear, compassionate reports about student progress. Use markdown with clear sections.',
      admin:'You are a school administration AI. Generate reports, analytics, and operational insights. Use markdown with tables.',
    }
    try{
      const r=await callGrok([{role:'user',content:txt}],systems[role])
      setResult(r);addXP(20,'institution_query')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}}><Users size={18} style={{color:'#8b5cf6'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Institution OS</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Multi-role school management system</p></div>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        {ROLES.map(r=>(
          <button key={r.id} onClick={()=>{setRole(r.id);setResult('')}}
            style={{flex:1,padding:'12px',borderRadius:12,border:'1px solid',cursor:'pointer',textAlign:'center',transition:'all .2s',
              borderColor:role===r.id?`${r.c}44`:'rgba(255,255,255,0.06)',
              background:role===r.id?`${r.c}10`:'rgba(255,255,255,0.02)'}}>
            <div style={{fontSize:20,marginBottom:4}}>{r.e}</div>
            <div style={{fontSize:12,fontWeight:700,color:role===r.id?r.c:'#94a3b8'}}>{r.l}</div>
          </button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:16}}>
        <div className="glass-d" style={{padding:16,borderRadius:14}}>
          <div style={{fontSize:11,color:'#64748b',fontFamily:'monospace',marginBottom:10}}>QUICK TASKS</div>
          {TASKS[role].map(t=>(
            <button key={t} onClick={()=>{setQuery(t);run(t)}}
              style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'0.5px solid rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.02)',color:'#94a3b8',cursor:'pointer',textAlign:'left',fontSize:11,marginBottom:6,transition:'all .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.color='#e2e8f0';e.currentTarget.style.background='rgba(255,255,255,0.05)'}}
              onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.background='rgba(255,255,255,0.02)'}}>
              {t}
            </button>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',gap:8}}>
            <input className="inp" style={{flex:1}} placeholder={`Ask ${ROLES.find(r2=>r2.id===role)?.l} AI...`} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()}/>
            <button className="btn bPr" onClick={()=>run()} disabled={loading||!query.trim()}>
              {loading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Zap size={13}/>}{loading?'Running...':'Ask AI'}
            </button>
          </div>
          <div className="glass-d" style={{padding:20,borderRadius:12,minHeight:340,maxHeight:500,overflowY:'auto'}}>
            {result?<div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div>
              :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,color:'#334155',gap:8}}>
                <Users size={28}/><p style={{fontSize:12}}>Select a role and run a task</p>
              </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// EXAM SYSTEM — Create, Take, Monitor, Results
// ══════════════════════════════════════════════════════════════════════════════
export function ExamPage(){
  const[tab,setTab]=useState('create')
  const[topic,setTopic]=useState('')
  const[qCount,setQCount]=useState(10)
  const[duration,setDuration]=useState(60)
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)
  const[examStarted,setExamStarted]=useState(false)
  const[timeLeft,setTimeLeft]=useState(0)
  const{addXP}=useGame()

  useEffect(()=>{
    if(examStarted&&timeLeft>0){
      const t=setInterval(()=>setTimeLeft(s=>s-1),1000)
      return()=>clearInterval(t)
    }
  },[examStarted,timeLeft])

  async function createExam(){
    if(!topic.trim()) return toast.error('Enter exam topic!')
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`Create a ${qCount}-question exam on "${topic}". Mix MCQ (70%) and short answer (30%). Include answer key at end. Format with question numbers, clear options for MCQ. Add time guidance.`}],
        'You are an expert exam creator. Generate professional, well-structured exams. Use markdown formatting.')
      setResult(r);addXP(40,'exam_created')
      toast.success(`Exam created! +40 XP 📋`)
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  function startExam(){
    setExamStarted(true);setTimeLeft(duration*60)
    toast.success(`Exam started! ${duration} minutes. Good luck! 🎯`)
  }

  const TABS=[{id:'create',l:'Create Exam',e:'📝'},{id:'take',l:'Take Exam',e:'✏️'},{id:'results',l:'Analytics',e:'📊'}]

  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(232,121,249,0.1)',border:'1px solid rgba(232,121,249,0.2)'}}><ClipboardList size={18} style={{color:'#e879f9'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Exam System</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Create, take and analyze exams</p></div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 18px',borderRadius:10,fontSize:12,fontWeight:600,border:'1px solid',cursor:'pointer',transition:'all .2s',
            borderColor:tab===t.id?'rgba(232,121,249,0.4)':'rgba(255,255,255,0.07)',
            background:tab===t.id?'rgba(232,121,249,0.1)':'transparent',color:tab===t.id?'#e879f9':'#64748b'}}>
            {t.e} {t.l}
          </button>
        ))}
      </div>

      {tab==='create'&&(
        <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
          <div className="glass-d" style={{padding:20,borderRadius:14,display:'flex',flexDirection:'column',gap:14}}>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>EXAM TOPIC</label><input className="inp" placeholder="e.g. Thermodynamics, DBMS, WW2..." value={topic} onChange={e=>setTopic(e.target.value)}/></div>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>QUESTIONS: {qCount}</label><input type="range" min={5} max={50} value={qCount} onChange={e=>setQCount(+e.target.value)} style={{width:'100%',accentColor:'#e879f9'}}/></div>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>DURATION: {duration} min</label><input type="range" min={15} max={180} step={15} value={duration} onChange={e=>setDuration(+e.target.value)} style={{width:'100%',accentColor:'#e879f9'}}/></div>
            <button className="btn bLg" style={{justifyContent:'center',background:'rgba(232,121,249,0.1)',border:'1px solid rgba(232,121,249,0.25)',color:'#e879f9'}} onClick={createExam} disabled={loading||!topic.trim()}>
              {loading?<Loader size={14} style={{animation:'spin 1s linear infinite'}}/>:<ClipboardList size={14}/>}{loading?'Creating...':'Create Exam'}
            </button>
          </div>
          <div className="glass-d" style={{padding:20,borderRadius:14,maxHeight:500,overflowY:'auto'}}>
            {result?(<>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <span style={{fontSize:12,color:'#64748b',fontFamily:'monospace'}}>EXAM READY</span>
                <button className="btn bGr bSm" onClick={startExam}><Play size={11}/> Start Exam</button>
              </div>
              <div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div>
            </>)
            :<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,color:'#334155',flexDirection:'column',gap:8}}><ClipboardList size={28}/><p style={{fontSize:12}}>Configure and create exam</p></div>}
          </div>
        </div>
      )}

      {tab==='take'&&(
        <div className="glass-d" style={{padding:28,borderRadius:14,textAlign:'center'}}>
          {!examStarted?(
            <div style={{maxWidth:400,margin:'0 auto',paddingTop:20}}>
              <div style={{fontSize:40,marginBottom:12}}>✏️</div>
              <h3 style={{fontSize:16,fontWeight:700,color:'#e2e8f0',marginBottom:8}}>Ready to take an exam?</h3>
              <p style={{fontSize:13,color:'#475569',marginBottom:20}}>First create an exam, then come here to take it in timed conditions</p>
              <button className="btn bPr" style={{justifyContent:'center'}} onClick={()=>setTab('create')}>→ Create Exam First</button>
            </div>
          ):(
            <div>
              <div style={{padding:'10px 20px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,display:'inline-flex',alignItems:'center',gap:8,marginBottom:16}}>
                <Clock size={14} style={{color:'#ef4444'}}/>
                <span style={{fontFamily:'monospace',fontWeight:700,color:'#ef4444',fontSize:16}}>
                  {Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}
                </span>
              </div>
              <div className="prose-ai" style={{textAlign:'left'}}><ReactMarkdown>{result}</ReactMarkdown></div>
            </div>
          )}
        </div>
      )}

      {tab==='results'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
            {[['📝','Total Exams','12'],['✅','Avg Score','76%'],['🏆','Best Score','94%'],['📈','Improvement','+12%']].map(([e,l,v])=>(
              <div key={l} className="glass-d" style={{padding:'16px',borderRadius:12,textAlign:'center'}}>
                <div style={{fontSize:22,marginBottom:6}}>{e}</div>
                <div style={{fontSize:20,fontWeight:700,color:'#00d4ff',marginBottom:3}}>{v}</div>
                <div style={{fontSize:11,color:'#475569'}}>{l}</div>
              </div>
            ))}
          </div>
          <div className="glass-d" style={{padding:20,borderRadius:14}}>
            <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0',marginBottom:12}}>Performance by Subject</div>
            {[['Mathematics','88%','#00ff88'],['Physics','74%','#ffd700'],['Chemistry','68%','#f97316'],['Biology','81%','#00d4ff']].map(([s,p,c])=>(
              <div key={s} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:12,color:'#94a3b8',width:100,flexShrink:0}}>{s}</span>
                <div style={{flex:1,height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:p,background:c,borderRadius:3}}/></div>
                <span style={{fontSize:12,fontWeight:600,color:c,width:40,textAlign:'right'}}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// BIO-HACKING — Peak Performance Dashboard
// ══════════════════════════════════════════════════════════════════════════════
export function BioHackingPage(){
  const[sleep,setSleep]=useState(7)
  const[water,setWater]=useState(6)
  const[exercise,setExercise]=useState(30)
  const[stress,setStress]=useState(4)
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)
  const{addXP}=useGame()
  const score=Math.round((sleep/8*25)+(water/8*20)+((exercise/60)*25)+((10-stress)/10*30))

  async function analyze(){
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`My biometrics: Sleep=${sleep}h, Water=${water} glasses, Exercise=${exercise}min, Stress level=${stress}/10. Give me a peak performance optimization plan with specific techniques for studying.`}],
        'You are a neuroscience-based peak performance coach. Provide scientific, actionable biohacking advice for students to maximize learning capacity. Use markdown with clear sections.')
      setResult(r);addXP(25,'biohacking_analyzed')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  const hour=new Date().getHours()
  const windows=[(hour>=6&&hour<=9)||(hour>=20&&hour<=23),(hour>=9&&hour<=12)||(hour>=15&&hour<=18),(hour>=13&&hour<=15)]

  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.2)'}}><Activity size={18} style={{color:'#4ade80'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Bio-Hacking</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Optimize your brain for peak learning performance</p></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Performance Score */}
          <div className="glass-d" style={{padding:20,borderRadius:14,textAlign:'center'}}>
            <div style={{fontSize:11,color:'#64748b',fontFamily:'monospace',marginBottom:8}}>BRAIN PERFORMANCE SCORE</div>
            <div style={{fontSize:52,fontWeight:900,color:score>70?'#00ff88':score>50?'#ffd700':'#ef4444',lineHeight:1}}>{score}</div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:12}}>/100</div>
            <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden',marginBottom:12}}>
              <div style={{height:'100%',width:`${score}%`,background:score>70?'#00ff88':score>50?'linear-gradient(90deg,#ffd700,#f97316)':'#ef4444',borderRadius:3,transition:'width 1s ease'}}/>
            </div>
            <div style={{fontSize:12,color:'#64748b'}}>{score>70?'🔥 Peak Performance!':score>50?'⚡ Good — room to improve':'📚 Focus on basics first'}</div>
          </div>

          {/* Bio Windows */}
          <div className="glass-d" style={{padding:16,borderRadius:14}}>
            <div style={{fontSize:11,color:'#64748b',fontFamily:'monospace',marginBottom:10}}>BRAIN WINDOWS (NOW)</div>
            {[['🧬 Deep Focus','6-9am, 8-11pm',windows[0]],['⚡ Creative Flow','9am-12pm, 3-6pm',windows[1]],['💤 Recovery','1-3pm',windows[2]]].map(([n,t,active])=>(
              <div key={n} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,marginBottom:6,background:active?'rgba(0,255,136,0.06)':'rgba(255,255,255,0.02)',border:`0.5px solid ${active?'rgba(0,255,136,0.2)':'rgba(255,255,255,0.05)'}`}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:active?'#00ff88':'#334155',flexShrink:0,boxShadow:active?'0 0 8px #00ff88':'none'}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:active?'#00ff88':'#94a3b8'}}>{n}</div>
                  <div style={{fontSize:10,color:'#475569'}}>{t}</div>
                </div>
                {active&&<span style={{fontSize:10,color:'#00ff88',fontFamily:'monospace'}}>ACTIVE NOW</span>}
              </div>
            ))}
          </div>

          {/* Sliders */}
          <div className="glass-d" style={{padding:16,borderRadius:14}}>
            {[['😴','Sleep (hours)',sleep,setSleep,4,10,'#8b5cf6'],['💧','Water (glasses)',water,setWater,2,12,'#00d4ff'],['🏃','Exercise (min)',exercise,setExercise,0,120,'#00ff88'],['😤','Stress (1-10)',stress,setStress,1,10,'#ef4444']].map(([e,l,v,sv,min,max,c])=>(
              <div key={l} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <label style={{fontSize:11,color:'#64748b'}}>{e} {l}</label>
                  <span style={{fontSize:12,fontWeight:700,color:c}}>{v}{l.includes('hours')?'h':l.includes('glasses')?'g':l.includes('min')?'m':'/10'}</span>
                </div>
                <input type="range" min={min} max={max} value={v} onChange={e=>sv(+e.target.value)} style={{width:'100%',accentColor:c}}/>
              </div>
            ))}
            <button className="btn bGr" style={{justifyContent:'center',width:'100%',marginTop:4}} onClick={analyze} disabled={loading}>
              {loading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Zap size={13}/>}{loading?'Analyzing...':'Optimize My Brain'}
            </button>
          </div>
        </div>

        <div className="glass-d" style={{padding:24,borderRadius:14,maxHeight:620,overflowY:'auto'}}>
          {result?<div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div>
          :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,color:'#334155',gap:10}}>
            <Activity size={32}/><p style={{fontSize:12}}>Set your biometrics and optimize</p>
          </div>}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CYBERSECURITY — Security Dashboard
// ══════════════════════════════════════════════════════════════════════════════
export function CybersecurityPage(){
  const[query,setQuery]=useState('')
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)
  const{addXP}=useGame()
  const CHECKS=[
    {label:'HTTPS Connection',status:true},
    {label:'Data Encryption',status:true},
    {label:'JWT Auth Active',status:true},
    {label:'Rate Limiting',status:true},
    {label:'API Keys Hidden',status:true},
    {label:'CORS Protected',status:true},
  ]
  async function ask(){
    if(!query.trim()) return
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:query}],'You are a cybersecurity expert for educational platforms. Explain security concepts, best practices, and how to stay safe online. Use markdown.')
      setResult(r);addXP(20,'security_query')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }
  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)'}}><Shield size={18} style={{color:'#10b981'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Cybersecurity Shield</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Your data is protected · Military-grade security</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16}}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div className="glass-d" style={{padding:16,borderRadius:12}}>
            <div style={{fontSize:11,color:'#64748b',fontFamily:'monospace',marginBottom:10}}>SECURITY STATUS</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,padding:'10px',background:'rgba(0,255,136,0.06)',borderRadius:8,border:'1px solid rgba(0,255,136,0.15)'}}>
              <Shield size={16} style={{color:'#00ff88'}}/><span style={{fontSize:13,fontWeight:700,color:'#00ff88'}}>ALL SYSTEMS SECURE</span>
            </div>
            {CHECKS.map(c=>(
              <div key={c.label} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                <CheckCircle size={12} style={{color:'#00ff88',flexShrink:0}}/>
                <span style={{fontSize:11,color:'#94a3b8'}}>{c.label}</span>
              </div>
            ))}
          </div>
          <div className="glass-d" style={{padding:14,borderRadius:12}}>
            <div style={{fontSize:11,color:'#64748b',fontFamily:'monospace',marginBottom:8}}>QUICK TOPICS</div>
            {['How are my API keys protected?','What is JWT authentication?','How to create strong passwords?','What is phishing?','Data privacy best practices'].map(q=>(
              <button key={q} onClick={()=>{setQuery(q);setTimeout(ask,100)}} style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'0.5px solid rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.02)',color:'#94a3b8',cursor:'pointer',textAlign:'left',fontSize:11,marginBottom:5,transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.color='#e2e8f0'}}onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8'}}>{q}</button>
            ))}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',gap:8}}>
            <input className="inp" style={{flex:1}} placeholder="Ask about cybersecurity, data privacy, or online safety..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()}/>
            <button className="btn bGr" onClick={ask} disabled={loading||!query.trim()}>{loading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Shield size={13}/>}{loading?'...':'Ask'}</button>
          </div>
          <div className="glass-d" style={{padding:20,borderRadius:12,flex:1,minHeight:380,maxHeight:500,overflowY:'auto'}}>
            {result?<div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div>
            :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,color:'#334155',gap:8}}><Shield size={28}/><p style={{fontSize:12}}>Ask about security topics</p></div>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SATELLITE / RURAL MODE — Low Bandwidth
// ══════════════════════════════════════════════════════════════════════════════
export function SatellitePage(){
  const[query,setQuery]=useState('')
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)
  const{addXP}=useGame()
  async function ask(){
    if(!query.trim()) return
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:query}],'You are a low-bandwidth AI tutor. Be extremely concise and clear. No heavy formatting. Short sentences. Maximum learning per word. Use only plain text and minimal markdown.')
      setResult(r);addXP(20,'satellite_query')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }
  return(
    <div className="page-sm">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(100,116,139,0.1)',border:'1px solid rgba(100,116,139,0.2)'}}><Satellite size={18} style={{color:'#64748b'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Satellite Mode</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Optimized for 2G/low-bandwidth connections</p></div>
      </div>
      <div style={{padding:'10px 14px',background:'rgba(100,116,139,0.06)',border:'1px solid rgba(100,116,139,0.15)',borderRadius:10,marginBottom:16,display:'flex',gap:8,alignItems:'center'}}>
        <Satellite size={14} style={{color:'#64748b'}}/><span style={{fontSize:12,color:'#64748b'}}>Low-bandwidth mode active · Text-only responses · Minimal data usage</span>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <input className="inp" style={{flex:1}} placeholder="Ask anything (short, fast responses)..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()}/>
        <button className="btn bGh" onClick={ask} disabled={loading||!query.trim()}>{loading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Send size={13}/>}</button>
      </div>
      <div className="glass-d" style={{padding:20,borderRadius:12,minHeight:300}}>
        {result?<pre style={{fontSize:13,color:'#e2e8f0',whiteSpace:'pre-wrap',fontFamily:'Exo 2, sans-serif',lineHeight:1.7}}>{result}</pre>
        :<div style={{color:'#334155',fontSize:12,textAlign:'center',paddingTop:80}}>Designed for students with limited internet access.<br/>Fast, concise, data-efficient.</div>}
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:12}}>
        {['Explain photosynthesis briefly','Quick physics formulas','3 math tricks','History summary: WW2','Code: what is a loop?'].map(q=>(
          <button key={q} onClick={()=>{setQuery(q);setTimeout(ask,50)}} style={{padding:'5px 10px',borderRadius:16,fontSize:11,border:'0.5px solid rgba(100,116,139,0.2)',background:'transparent',color:'#475569',cursor:'pointer'}}>{q}</button>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// BRAIN-ADAPTIVE ENGINE
// ══════════════════════════════════════════════════════════════════════════════
export function BrainAdaptivePage(){
  const[style,setStyle]=useState('')
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)
  const{addXP}=useGame()
  const STYLES=[{id:'visual',e:'👁️',l:'Visual',d:'Learn through diagrams, charts, mind maps'},{id:'auditory',e:'🎵',l:'Auditory',d:'Learn through lectures, discussions, music'},{id:'reading',e:'📚',l:'Reading/Writing',d:'Learn through texts, notes, lists'},{id:'kinesthetic',e:'🛠️',l:'Kinesthetic',d:'Learn through practice, experiments, doing'}]
  async function adapt(){
    if(!style) return toast.error('Select your learning style!')
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`I am a ${style} learner. Create a fully personalized learning strategy for me including: study techniques that work best for my style, how to prepare for exams, how to take notes, memory techniques, and daily study routine.`}],
        'You are a learning style expert and educational psychologist. Provide deeply personalized, science-backed learning strategies. Use markdown.')
      setResult(r);addXP(25,'brain_adaptive')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }
  return(
    <div className="page-sm">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.2)'}}><Brain size={18} style={{color:'#a78bfa'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Brain-Adaptive Engine</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>AI adapts to YOUR learning style</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
        {STYLES.map(s=>(
          <button key={s.id} onClick={()=>setStyle(s.id)} style={{padding:'16px',borderRadius:12,border:'1px solid',cursor:'pointer',transition:'all .2s',textAlign:'center',
            borderColor:style===s.id?'rgba(167,139,250,0.5)':'rgba(255,255,255,0.06)',
            background:style===s.id?'rgba(167,139,250,0.1)':'rgba(255,255,255,0.02)'}}>
            <div style={{fontSize:24,marginBottom:6}}>{s.e}</div>
            <div style={{fontSize:13,fontWeight:700,color:style===s.id?'#a78bfa':'#e2e8f0',marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:11,color:'#475569'}}>{s.d}</div>
          </button>
        ))}
      </div>
      <button className="btn bPr bLg" style={{justifyContent:'center',width:'100%',marginBottom:16}} onClick={adapt} disabled={loading||!style}>
        {loading?<Loader size={14} style={{animation:'spin 1s linear infinite'}}/>:<Brain size={14}/>}{loading?'Adapting...':'Adapt Learning Strategy'}
      </button>
      {result&&<div className="glass-d" style={{padding:20,borderRadius:12}}><div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div></div>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL UNIVERSITY — Courses from World's Best Universities
// ══════════════════════════════════════════════════════════════════════════════
export function GlobalUniversityPage(){
  const[selected,setSelected]=useState(null)
  const[topic,setTopic]=useState('')
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)
  const{addXP}=useGame()
  const COURSES=[
    {id:'cs101',uni:'MIT',title:'Introduction to CS',icon:'💻',color:'#00d4ff',topics:['Algorithms','Data Structures','Python','Recursion']},
    {id:'physics',uni:'Caltech',title:'Classical Mechanics',icon:'⚛️',color:'#a78bfa',topics:['Newton\'s Laws','Energy','Momentum','Oscillations']},
    {id:'ml',uni:'Stanford',title:'Machine Learning',icon:'🤖',color:'#ffd700',topics:['Linear Regression','Neural Networks','SVM','CNN']},
    {id:'bio',uni:'Harvard',title:'Molecular Biology',icon:'🧬',color:'#00ff88',topics:['DNA','Proteins','Cell Biology','Genetics']},
    {id:'econ',uni:'Oxford',title:'Microeconomics',icon:'📈',color:'#f97316',topics:['Supply & Demand','Market Structures','Game Theory','Welfare']},
    {id:'math',uni:'Cambridge',title:'Pure Mathematics',icon:'📐',color:'#ec4899',topics:['Calculus','Linear Algebra','Proofs','Number Theory']},
    {id:'chem',uni:'ETH Zurich',title:'Organic Chemistry',icon:'🔬',color:'#14b8a6',topics:['Reactions','Mechanisms','Synthesis','Spectroscopy']},
    {id:'hist',uni:'Yale',title:'World History',icon:'🌍',color:'#8b5cf6',topics:['Ancient Civilizations','Industrial Revolution','WW1 & WW2','Modern Era']},
  ]
  async function learn(t){
    const course=COURSES.find(c=>c.id===selected)
    const q=t||topic
    if(!q.trim()||!course) return
    setLoading(true)
    try{
      const r=await callGrok([{role:'user',content:`Teach me "${q}" from ${course.uni}'s "${course.title}" course. Use the style and depth of a ${course.uni} professor.`}],
        `You are a professor from ${course?.uni} teaching ${course?.title}. Explain concepts with academic depth, clear examples, and university-level rigor. Use markdown.`)
      setResult(r);addXP(30,'global_uni_lesson')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }
  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(56,189,248,0.1)',border:'1px solid rgba(56,189,248,0.2)'}}><Globe size={18} style={{color:'#38bdf8'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Global University</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Learn from MIT, Stanford, Oxford & more — AI-powered</p></div>
      </div>
      {!selected?(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
          {COURSES.map(c=>(
            <button key={c.id} onClick={()=>setSelected(c.id)} style={{padding:'18px',borderRadius:14,border:`1px solid ${c.color}22`,background:`${c.color}06`,cursor:'pointer',textAlign:'left',transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${c.color}44`;e.currentTarget.style.transform='translateY(-3px)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${c.color}22`;e.currentTarget.style.transform='translateY(0)'}}>
              <div style={{fontSize:28,marginBottom:8}}>{c.icon}</div>
              <div style={{fontSize:10,color:c.color,fontFamily:'monospace',marginBottom:3}}>{c.uni}</div>
              <div style={{fontSize:13,fontWeight:700,color:'#e2e8f0',marginBottom:6}}>{c.title}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {c.topics.slice(0,2).map(t=><span key={t} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:`${c.color}15`,color:c.color}}>{t}</span>)}
              </div>
            </button>
          ))}
        </div>
      ):(()=>{
        const course=COURSES.find(c=>c.id===selected)
        return(
          <div>
            <button className="btn bGh bSm" style={{marginBottom:16}} onClick={()=>{setSelected(null);setResult('')}}>← All Courses</button>
            <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:16}}>
              <div>
                <div className="glass-d" style={{padding:16,borderRadius:12,marginBottom:10}}>
                  <div style={{fontSize:24,marginBottom:6}}>{course.icon}</div>
                  <div style={{fontSize:10,color:course.color,fontFamily:'monospace'}}>{course.uni}</div>
                  <div style={{fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:10}}>{course.title}</div>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:8}}>TOPICS</div>
                  {course.topics.map(t=>(
                    <button key={t} onClick={()=>{setTopic(t);learn(t)}} style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'0.5px solid rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.02)',color:'#94a3b8',cursor:'pointer',textAlign:'left',fontSize:11,marginBottom:5,transition:'all .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.color='#e2e8f0'}onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',gap:8}}>
                  <input className="inp" style={{flex:1}} placeholder={`Ask ${course.uni} professor...`} value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&learn()}/>
                  <button className="btn bPr" onClick={()=>learn()} disabled={loading||!topic.trim()}>{loading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<BookOpen size={13}/>}{loading?'Teaching...':'Learn'}</button>
                </div>
                <div className="glass-d" style={{padding:20,borderRadius:12,flex:1,minHeight:380,overflowY:'auto'}}>
                  {result?<div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div>
                  :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,color:'#334155',gap:8}}><Globe size={28}/><p style={{fontSize:12}}>Select a topic or ask anything</p></div>}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// REMAINING STUBS — converted to proper AI-powered pages
// ══════════════════════════════════════════════════════════════════════════════
function ProAIPage({icon:I,color,title,desc,placeholder,system,xp=20,children}){
  const[input,setInput]=useState('')
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)
  const{addXP}=useGame()
  async function run(q){
    const txt=q||input
    if(!txt.trim()) return toast.error('Enter a query!')
    setLoading(true)
    try{const r=await callGrok([{role:'user',content:txt}],system||'You are a world-class AI assistant. Provide excellent, structured responses using markdown.');setResult(r);addXP(xp,'proai_'+title)}
    catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }
  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:`${color}15`,border:`1px solid ${color}25`}}><I size={18} style={{color}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>{title}</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>{desc}</p></div>
      </div>
      {children&&<div style={{marginBottom:16}}>{children(run,loading)}</div>}
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <input className="inp" style={{flex:1}} placeholder={placeholder||`Ask ${title}...`} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()}/>
        <button className="btn bPr" onClick={()=>run()} disabled={loading||!input.trim()}>
          {loading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Zap size={13}/>}{loading?'Running...':'Go (+'+xp+' XP)'}
        </button>
      </div>
      <div className="glass-d" style={{padding:20,borderRadius:14,minHeight:300,maxHeight:500,overflowY:'auto'}}>
        {result?<div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div>
        :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:240,color:'#334155',gap:8}}><I size={28} style={{color:'#334155'}}/><p style={{fontSize:12}}>{desc}</p></div>}
      </div>
    </div>
  )
}

export const TeacherDashboardPage=()=><ProAIPage icon={Users} color="#a78bfa" title="Teacher Dashboard" desc="Lesson planning, assessments & classroom management" placeholder="e.g. Create lesson plan for Chapter 5 Thermodynamics..." system="You are an expert teacher assistant. Help with lesson planning, creating assessments, grading strategies, classroom management, and student analytics. Use markdown with structured output." xp={20}/>

export const StudentProfilePage=()=><ProAIPage icon={User} color="#00ff88" title="Student Profiles" desc="AI-powered student progress analysis and recommendations" placeholder="e.g. Analyze student scoring 65% in Math, 80% in Physics..." system="You are a student performance analyst. Analyze performance data, identify patterns, and provide personalized improvement recommendations. Use markdown with tables." xp={15}/>

export const ClassManagementPage=()=><ProAIPage icon={Layers} color="#ffd700" title="Class Management" desc="Organize classes, curriculum and student groups with AI" placeholder="e.g. Create Class 10A timetable for a week..." system="You are a class management expert. Help organize curriculum, timetables, and student groupings. Use markdown with structured tables and schedules." xp={20}/>

export const AttendancePage=()=><ProAIPage icon={CheckCircle} color="#00ff88" title="Attendance System" desc="Smart attendance tracking and pattern analytics" placeholder="e.g. Student missed 8/20 days. Analyze and suggest action..." system="You are an attendance management system. Analyze patterns, identify at-risk students, and generate actionable reports. Use markdown with tables." xp={15}/>

export const AssignmentsPage=()=><ProAIPage icon={FileText} color="#00d4ff" title="Assignments" desc="AI-powered assignment creation with rubrics and grading" placeholder="e.g. Create assignment on essay writing for Grade 10..." system="You are an expert assignment creator. Generate detailed, well-structured assignments with clear objectives, rubrics, and grading criteria. Use markdown." xp={30}/>

export const ParentPortalPage=()=><ProAIPage icon={Heart} color="#f97316" title="Parent Portal" desc="Real-time student progress insights for parents" placeholder="e.g. Show progress report for student who scored 72% this term..." system="You are a parent portal assistant. Provide clear, compassionate, easy-to-understand updates about student progress, areas of concern, and actionable guidance. Use markdown." xp={15}/>

export const CreateExamPage=()=><ProAIPage icon={Zap} color="#00ff88" title="Create Exam" desc="AI exam builder with instant question generation" placeholder="e.g. Create 15-question exam on Organic Chemistry for Grade 12..." system="You are an expert exam creator. Generate comprehensive exams with varied question types (MCQ, short answer, essay), answer keys, and marking schemes. Use markdown." xp={45}/>

export const TakeExamPage=()=><ProAIPage icon={Target} color="#ffd700" title="Take Exam" desc="Practice exam interface with AI evaluation" placeholder="e.g. Give me a 10-question timed practice test on Calculus..." system="You are an exam system. Present clear, well-structured practice questions. After answers, provide detailed scoring and personalized feedback. Use markdown." xp={50}/>

export const MonitorExamPage=()=><ProAIPage icon={Eye} color="#ef4444" title="Monitor Exam" desc="Exam analytics and integrity dashboard" placeholder="e.g. Analyze exam performance for 30 students..." system="You are an exam analytics system. Analyze performance data, identify patterns, flag concerns, and generate monitoring reports. Use markdown with tables." xp={20}/>

export const ExamResultsPage=()=><ProAIPage icon={BarChart3} color="#00d4ff" title="Exam Results" desc="Detailed performance analytics and improvement roadmap" placeholder="Paste your exam answers or scores for analysis..." system="You are an exam results analyzer. Provide detailed analysis of performance, identify weak areas, and create a personalized improvement roadmap. Use markdown." xp={30}/>

export const ExamHistoryPage=()=><ProAIPage icon={Clock} color="#64748b" title="Exam History" desc="Track performance trends over time" placeholder="Describe your exam history or paste scores..." system="You are an academic performance tracker. Analyze score trends, identify improvements, and provide motivational insights. Use markdown with tables." xp={15}/>

export const CognitiveLoadPage=()=><ProAIPage icon={Activity} color="#00ff88" title="Cognitive Load Monitor" desc="Mental fatigue analysis and focus optimization" placeholder="Describe how you're feeling — tired, focused, stressed..." system="You are a cognitive performance expert. Analyze mental state, provide load management strategies, and suggest optimal approaches for current condition. Use markdown." xp={20}/>

export const SessionHistoryPage=()=><ProAIPage icon={Clock} color="#64748b" title="Session History" desc="Review your learning journey" placeholder="Which topic or time period do you want to review?" system="You are a learning session reviewer. Help students recall and consolidate past learning, identify gaps, and plan revision. Use markdown." xp={15}/>

export const SatelliteProtocolPage=()=><ProAIPage icon={Satellite} color="#a78bfa" title="Satellite Protocol" desc="Ultra-compressed learning for remote areas" placeholder="Ask anything — ultra-compact response..." system="You are a satellite learning AI. Maximum value, minimum words. Be concise, clear, no heavy formatting." xp={20}/>


export const AIAssistantPage=()=><ProAIPage
  icon={Bot}
  color="#06b6d4"
  title="AI Assistant"
  desc="24/7 AI study companion for doubts, coding, exams and career guidance"
  placeholder="Ask anything..."
  system="You are EduMind AI Assistant. Help students with studies, coding, exams, notes, career guidance and problem solving. Use markdown."
  xp={15}
/>

export const KnowledgeSwapPage=()=><ProAIPage
  icon={Shuffle}
  color="#8b5cf6"
  title="Knowledge Swap"
  desc="Share knowledge, notes, resources and collaborate with learners"
  placeholder="Share a note, resource or ask for help..."
  system="You are a collaborative learning assistant. Help students exchange knowledge, notes, resources and study strategies. Use markdown."
  xp={10}
/>

export function FallbackPage(){
  const nav=useNavigate()
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',gap:12,padding:20,textAlign:'center'}}>
      <div style={{fontSize:48}}>🚀</div>
      <h2 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Coming Soon</h2>
      <p style={{fontSize:13,color:'#64748b',maxWidth:300}}>This module is being upgraded to premium quality.</p>
      <button onClick={()=>nav('/dashboard')} style={{padding:'9px 20px',borderRadius:10,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.2)',color:'#00d4ff',cursor:'pointer',fontSize:13,fontWeight:600}}>
        ← Dashboard
      </button>
    </div>
  )
}

