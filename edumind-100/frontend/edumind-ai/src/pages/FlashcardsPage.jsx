import {useState} from 'react'
import {useLearn,useGame} from '../lib/store'
import {generateFlashcardsAPI,fireConfetti} from '../lib/api'
import toast from 'react-hot-toast'
import {BookOpen,Loader,RotateCcw,ChevronLeft,ChevronRight,ThumbsUp,ThumbsDown,Minus} from 'lucide-react'

export default function FlashcardsPage(){
  const{saveFlashcards,flashcardSets}=useLearn()
  const{addXP}=useGame()
  const[topic,setTopic]=useState('')
  const[count,setCount]=useState(10)
  const[cards,setCards]=useState([])
  const[idx,setIdx]=useState(0)
  const[flipped,setFlipped]=useState(false)
  const[ratings,setRatings]=useState({})
  const[loading,setLoading]=useState(false)
  const[phase,setPhase]=useState('setup')

  async function generate(){
    if(!topic.trim()) return toast.error('Enter a topic!')
    setLoading(true)
    try{
      const data=await generateFlashcardsAPI(topic.trim(),count)
      const c=data.cards||[]
      if(!c.length) throw new Error('No flashcards generated')
      setCards(c);setIdx(0);setFlipped(false);setRatings({});setPhase('study')
      toast.success(`${c.length} flashcards ready! 📚`)
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  function rate(r){
    setRatings(rt=>({...rt,[idx]:r}))
    addXP(5,'flashcard_rated')
    if(idx<cards.length-1){setIdx(i=>i+1);setFlipped(false)}
    else{
      const easy=Object.values({...ratings,[idx]:r}).filter(v=>v==='easy').length
      const xp=easy*10+cards.length*5
      addXP(xp,'flashcard_complete')
      saveFlashcards({topic,cards})
      fireConfetti()
      toast.success(`Session done! +${xp} XP 🎉`)
      setPhase('done')
    }
  }

  if(phase==='done'){
    const e=Object.values(ratings).filter(v=>v==='easy').length
    const g=Object.values(ratings).filter(v=>v==='good').length
    const h=Object.values(ratings).filter(v=>v==='hard').length
    return(
      <div className="page-sm" style={{textAlign:'center',paddingTop:40}}>
        <div style={{fontSize:48,marginBottom:12}}>🎴</div>
        <h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',marginBottom:8}}>Session Complete!</h2>
        <p style={{color:'#64748b',marginBottom:24}}>{cards.length} cards reviewed on {topic}</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:28}}>
          <div className="glass" style={{padding:'14px 20px',borderRadius:12,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#00ff88'}}>{e}</div><div style={{fontSize:11,color:'#475569'}}>Easy</div>
          </div>
          <div className="glass" style={{padding:'14px 20px',borderRadius:12,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#ffd700'}}>{g}</div><div style={{fontSize:11,color:'#475569'}}>Good</div>
          </div>
          <div className="glass" style={{padding:'14px 20px',borderRadius:12,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#ef4444'}}>{h}</div><div style={{fontSize:11,color:'#475569'}}>Hard</div>
          </div>
        </div>
        <button className="btn bPr" style={{justifyContent:'center'}} onClick={()=>{setPhase('setup');setCards([]);setTopic('')}}>
          <RotateCcw size={13}/> New Session
        </button>
      </div>
    )
  }

  if(phase==='study'&&cards.length>0){
    const card=cards[idx]
    return(
      <div className="page-sm">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div style={{fontSize:13,color:'#64748b'}}>{idx+1} / {cards.length}</div>
          <div style={{fontSize:11,color:'#64748b',fontFamily:'monospace'}}>{topic}</div>
          <button onClick={()=>setPhase('setup')} className="btn bGh bSm"><RotateCcw size={11}/> Restart</button>
        </div>
        <div style={{height:6,background:'rgba(236,72,153,0.08)',borderRadius:3,marginBottom:24,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${((idx+1)/cards.length)*100}%`,background:'linear-gradient(90deg,#7c3aed,#ec4899)',borderRadius:3,transition:'width .3s'}}/>
        </div>

        {/* Card */}
        <div onClick={()=>setFlipped(!flipped)} style={{cursor:'pointer',marginBottom:20,perspective:1000}}>
          <div style={{minHeight:200,borderRadius:16,border:`1px solid ${flipped?'rgba(236,72,153,0.3)':'rgba(0,212,255,0.2)'}`,background:flipped?'rgba(236,72,153,0.06)':'rgba(0,212,255,0.04)',padding:'28px 24px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',transition:'all .3s',boxShadow:flipped?'0 8px 32px rgba(236,72,153,0.1)':'0 8px 32px rgba(0,212,255,0.08)'}}>
            <div style={{fontSize:11,color:flipped?'#ec4899':'#00d4ff',fontFamily:'monospace',marginBottom:12,letterSpacing:'0.1em'}}>{flipped?'ANSWER':'QUESTION — tap to flip'}</div>
            <div style={{fontSize:16,color:'#e2e8f0',fontWeight:600,lineHeight:1.6}}>{flipped?card.back:card.front}</div>
            <div style={{marginTop:12,fontSize:10,color:'#334155'}}>
              {flipped?'👆 Tap to see question again':'👆 Tap to reveal answer'}
            </div>
          </div>
        </div>

        {flipped&&(
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button className="btn bDg" style={{flex:1,justifyContent:'center',fontSize:13}} onClick={()=>rate('hard')}>
              <ThumbsDown size={13}/> Hard
            </button>
            <button className="btn bGo" style={{flex:1,justifyContent:'center',fontSize:13}} onClick={()=>rate('good')}>
              <Minus size={13}/> Good
            </button>
            <button className="btn bGr" style={{flex:1,justifyContent:'center',fontSize:13}} onClick={()=>rate('easy')}>
              <ThumbsUp size={13}/> Easy
            </button>
          </div>
        )}
        {!flipped&&<p style={{textAlign:'center',fontSize:12,color:'#334155',marginTop:8}}>Rate after you see the answer</p>}
      </div>
    )
  }

  return(
    <div className="page-sm">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(236,72,153,0.1)',border:'1px solid rgba(236,72,153,0.2)'}}><BookOpen size={18} style={{color:'#ec4899'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Flashcards</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Spaced repetition learning</p></div>
      </div>
      <div className="glass-d" style={{padding:28,borderRadius:16}}>
        <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:8,fontFamily:'monospace'}}>TOPIC</label>
        <input className="inp" placeholder="e.g. Organic Chemistry Reactions, Data Structures..." value={topic} onChange={e=>setTopic(e.target.value)} style={{marginBottom:16}} onKeyDown={e=>e.key==='Enter'&&generate()}/>
        <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:8,fontFamily:'monospace'}}>CARDS: {count}</label>
        <input type="range" min={5} max={30} value={count} onChange={e=>setCount(+e.target.value)} style={{width:'100%',accentColor:'#ec4899',marginBottom:20}}/>
        <button className="btn bLg" style={{justifyContent:'center',width:'100%',background:'rgba(236,72,153,0.12)',border:'1px solid rgba(236,72,153,0.25)',color:'#ec4899'}} onClick={generate} disabled={loading||!topic.trim()}>
          {loading?<Loader size={14} style={{animation:'spin 1s linear infinite'}}/>:<BookOpen size={14}/>}
          {loading?'Generating...':'Generate Flashcards'}
        </button>
      </div>
      {flashcardSets.length>0&&(
        <div style={{marginTop:20}}>
          <div style={{fontSize:12,color:'#64748b',marginBottom:10,fontFamily:'monospace'}}>PREVIOUS SETS</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {flashcardSets.slice(0,5).map(s=>(
              <button key={s.id} onClick={()=>{setCards(s.cards);setTopic(s.topic);setIdx(0);setFlipped(false);setRatings({});setPhase('study')}}
                style={{padding:'12px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.02)',cursor:'pointer',textAlign:'left',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:13,color:'#e2e8f0'}}>{s.topic}</span>
                <span style={{fontSize:11,color:'#475569'}}>{s.cards?.length||0} cards</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
