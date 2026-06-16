import {useState,useRef,useEffect} from 'react'
import {useUI,useGame,useLearn,useChat} from '../lib/store'
import {callGrok,PERSONAS,fireConfetti} from '../lib/api'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {Brain,Send,Trash2,Copy,ThumbsUp,Zap,Loader,Plus,Sparkles} from 'lucide-react'

const QUICK=['Explain Newton\'s laws simply','Give me JEE tips','How to improve memory?','Best study techniques','Explain quantum entanglement','Career advice for CSE students','Help me write a study plan','Motivate me to study']

export default function AGIMentorPage(){
  const CHAT_ID='agi-main'
  const{persona,setPersona}=useUI()
  const{addXP}=useGame()
  const{addSession}=useLearn()
  const{getH,addMsg,clearChat}=useChat()
  const[input,setInput]=useState('')
  const[loading,setLoading]=useState(false)
  const[liked,setLiked]=useState(new Set())
  const msgs=getH(CHAT_ID)
  const endRef=useRef(null)
  const inputRef=useRef(null)
  const sessionStart=useRef(Date.now())

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[msgs])

  async function send(text){
    const q=(text||input).trim()
    if(!q||loading) return
    setInput('')
    addMsg(CHAT_ID,'user',q)
    setLoading(true)
    try{
      const history=getH(CHAT_ID).slice(-10).map(m=>({role:m.role,content:m.content}))
      const r=await callGrok([...history,{role:'user',content:q}],'',false,persona)
      addMsg(CHAT_ID,'assistant',r)
      addXP(10,'ai_chat')
    }catch(err){
      toast.error(err.message)
      addMsg(CHAT_ID,'assistant','⚠️ '+err.message)
    }finally{setLoading(false)}
  }

  function handleKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}

  function copyMsg(txt){navigator.clipboard.writeText(txt).then(()=>toast.success('Copied!'))}

  function clearAll(){
    clearChat(CHAT_ID)
    const dur=Math.round((Date.now()-sessionStart.current)/60000)
    if(dur>0) addSession({module:'AGI Mentor',duration:dur})
    sessionStart.current=Date.now()
  }

  const curPersona=PERSONAS.find(p=>p.id===persona)||PERSONAS[3]

  return(
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 52px)'}}>
      {/* Header */}
      <div style={{padding:'14px 24px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <div style={{width:36,height:36,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Brain size={18} style={{color:'#00d4ff'}}/>
        </div>
        <div>
          <h1 style={{fontSize:15,fontWeight:700,color:'#e2e8f0'}}>AGI Mentor</h1>
          <div style={{fontSize:11,color:'#475569'}}>{msgs.length} messages · {curPersona.emoji} {curPersona.label}</div>
        </div>
        {/* Persona Tabs */}
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          {PERSONAS.map(p=>(
            <button key={p.id} onClick={()=>setPersona(p.id)}
              style={{padding:'5px 12px',borderRadius:8,fontSize:11,fontWeight:600,border:'1px solid',cursor:'pointer',transition:'all .2s',
                borderColor:persona===p.id?'rgba(0,212,255,0.4)':'rgba(255,255,255,0.07)',
                background:persona===p.id?'rgba(0,212,255,0.1)':'transparent',
                color:persona===p.id?'#00d4ff':'#64748b'}}>
              {p.emoji} {p.label.split(' ')[0]}
            </button>
          ))}
          {msgs.length>0&&(
            <button onClick={clearAll} style={{marginLeft:8,padding:'5px 10px',borderRadius:8,fontSize:11,border:'1px solid rgba(255,255,255,0.07)',background:'transparent',color:'#64748b',cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
              <Trash2 size={11}/> Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16,scrollbarWidth:'thin',scrollbarColor:'rgba(255,255,255,0.06) transparent'}}>
        {msgs.length===0&&(
          <div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{fontSize:40,marginBottom:12}}>🧠</div>
            <h2 style={{fontSize:18,fontWeight:700,color:'#e2e8f0',marginBottom:6}}>Ask me anything</h2>
            <p style={{fontSize:13,color:'#475569',marginBottom:24}}>Your {curPersona.emoji} {curPersona.label} is ready</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',maxWidth:600,margin:'0 auto'}}>
              {QUICK.map(q=>(
                <button key={q} onClick={()=>send(q)}
                  style={{padding:'7px 14px',borderRadius:20,fontSize:12,border:'1px solid rgba(0,212,255,0.15)',background:'rgba(0,212,255,0.04)',color:'#64748b',cursor:'pointer',transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.color='#00d4ff';e.currentTarget.style.borderColor='rgba(0,212,255,0.3)'}}
                  onMouseLeave={e=>{e.currentTarget.style.color='#64748b';e.currentTarget.style.borderColor='rgba(0,212,255,0.15)'}}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',gap:10,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}}>
            <div style={{width:30,height:30,borderRadius:8,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,
              background:m.role==='user'?'linear-gradient(135deg,#7c3aed,#00d4ff)':'rgba(0,212,255,0.08)',
              border:m.role==='assistant'?'1px solid rgba(0,212,255,0.15)':'none'}}>
              {m.role==='user'?'👤':curPersona.emoji}
            </div>
            <div style={{maxWidth:'75%',minWidth:60}}>
              <div style={{padding:'12px 16px',borderRadius:m.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px',fontSize:13,lineHeight:1.65,
                background:m.role==='user'?'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(0,212,255,0.1))':'rgba(5,13,28,0.7)',
                border:m.role==='user'?'1px solid rgba(124,58,237,0.2)':'1px solid rgba(255,255,255,0.06)',color:'#e2e8f0'}}>
                {m.role==='assistant'
                  ?<div className="prose-ai"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  :<span style={{whiteSpace:'pre-wrap'}}>{m.content}</span>}
              </div>
              {m.role==='assistant'&&(
                <div style={{display:'flex',gap:6,marginTop:6,paddingLeft:4}}>
                  <button onClick={()=>copyMsg(m.content)} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:6,border:'none',background:'transparent',color:'#334155',cursor:'pointer',fontSize:10,transition:'color .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.color='#64748b'} onMouseLeave={e=>e.currentTarget.style.color='#334155'}>
                    <Copy size={10}/> Copy
                  </button>
                  <button onClick={()=>{setLiked(s=>{const n=new Set(s);n.add(i);return n});addXP(5,'liked_response')}}
                    style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:6,border:'none',background:'transparent',cursor:'pointer',fontSize:10,transition:'color .15s',color:liked.has(i)?'#00ff88':'#334155'}}>
                    <ThumbsUp size={10}/> {liked.has(i)?'Liked':'Like'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading&&(
          <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{width:30,height:30,borderRadius:8,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{curPersona.emoji}</div>
            <div style={{padding:'12px 16px',borderRadius:'4px 14px 14px 14px',background:'rgba(5,13,28,0.7)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{display:'flex',gap:4}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#00d4ff',animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'12px 24px 16px',borderTop:'1px solid rgba(255,255,255,0.05)',flexShrink:0}}>
        <div style={{display:'flex',gap:10,alignItems:'flex-end',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'10px 14px',transition:'border-color .2s'}}
          onFocusCapture={e=>e.currentTarget.style.borderColor='rgba(0,212,255,0.3)'}
          onBlurCapture={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
            placeholder={`Ask ${curPersona.label}... (Enter to send, Shift+Enter for newline)`}
            rows={1} style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#e2e8f0',fontSize:13,resize:'none',fontFamily:'Exo 2, sans-serif',lineHeight:1.5,maxHeight:120,overflowY:'auto'}}
            onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{width:34,height:34,borderRadius:9,background:input.trim()&&!loading?'linear-gradient(135deg,#7c3aed,#00d4ff)':'rgba(255,255,255,0.05)',border:'none',cursor:input.trim()&&!loading?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s'}}>
            {loading?<Loader size={14} style={{color:'#64748b',animation:'spin 1s linear infinite'}}/>:<Send size={14} style={{color:input.trim()?'#fff':'#334155'}}/>}
          </button>
        </div>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <span style={{fontSize:10,color:'#334155',fontFamily:'monospace'}}>⚡ Multi-AI: Groq→Sambanova→OpenRouter→Gemini</span>
          <span style={{fontSize:10,color:'#334155',marginLeft:'auto'}}>+10 XP per message</span>
        </div>
      </div>
    </div>
  )
}
