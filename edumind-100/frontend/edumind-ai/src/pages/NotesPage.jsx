import {useState} from 'react'
import {useLearn,useGame} from '../lib/store'
import {enhanceNotesAPI} from '../lib/api'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {FileText,Wand2,Save,Trash2,Loader,Plus,Clock} from 'lucide-react'

const STYLES=[{id:'structured',l:'Structured',e:'📋'},{id:'cornell',l:'Cornell',e:'📓'},{id:'summary',l:'Summary',e:'📝'},{id:'mindmap',l:'Mind Map',e:'🗺️'}]

export default function NotesPage(){
  const{notes,saveNote}=useLearn()
  const{addXP}=useGame()
  const[title,setTitle]=useState('')
  const[content,setContent]=useState('')
  const[enhanced,setEnhanced]=useState('')
  const[style,setStyle]=useState('structured')
  const[loading,setLoading]=useState(false)
  const[view,setView]=useState('write') // write | enhanced | saved

  async function enhance(){
    if(!content.trim()) return toast.error('Write some notes first!')
    setLoading(true)
    try{
      const r=await enhanceNotesAPI(content,style)
      setEnhanced(r)
      setView('enhanced')
      addXP(15,'notes_enhanced')
      toast.success('Notes enhanced! +15 XP ✨')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  function save(){
    if(!content.trim()) return toast.error('Write some content first!')
    saveNote({title:title||'Untitled Note',content,enhanced})
    addXP(10,'note_saved')
    toast.success('Note saved! +10 XP')
    setTitle('');setContent('');setEnhanced('');setView('write')
  }

  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)'}}><FileText size={18} style={{color:'#f97316'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Smart Notes</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Write → AI enhances → Save</p></div>
        <button onClick={()=>setView('saved')} className="btn bGh bSm" style={{marginLeft:'auto'}}>
          <Clock size={12}/> Saved ({notes.length})
        </button>
      </div>

      {view==='saved'?(
        <div>
          <button onClick={()=>setView('write')} className="btn bGh bSm" style={{marginBottom:16}}><Plus size={12}/> New Note</button>
          {notes.length===0?(
            <div style={{textAlign:'center',padding:40,color:'#475569'}}>No saved notes yet. Write your first note!</div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
              {notes.map(n=>(
                <div key={n.id} className="glass-d" style={{padding:16,borderRadius:12,cursor:'pointer'}} onClick={()=>{setTitle(n.title);setContent(n.content);setEnhanced(n.enhanced||'');setView('write')}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0',marginBottom:4}}>{n.title}</div>
                  <div style={{fontSize:11,color:'#475569',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{n.content}</div>
                  <div style={{fontSize:10,color:'#334155',marginTop:8}}>{new Date(n.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {/* Write side */}
          <div>
            <input className="inp" placeholder="Note title..." value={title} onChange={e=>setTitle(e.target.value)} style={{marginBottom:10}}/>
            <textarea className="inp" placeholder="Write your notes here... (paste lecture notes, book excerpts, or your own notes)" value={content} onChange={e=>setContent(e.target.value)} style={{minHeight:320,fontFamily:'Exo 2, sans-serif',fontSize:13}}/>

            <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
              {STYLES.map(s=>(
                <button key={s.id} onClick={()=>setStyle(s.id)} style={{padding:'6px 12px',borderRadius:8,fontSize:11,fontWeight:600,border:'1px solid',cursor:'pointer',transition:'all .15s',
                  borderColor:style===s.id?'rgba(249,115,22,0.4)':'rgba(255,255,255,0.07)',
                  background:style===s.id?'rgba(249,115,22,0.1)':'transparent',color:style===s.id?'#f97316':'#64748b'}}>
                  {s.e} {s.l}
                </button>
              ))}
            </div>

            <div style={{display:'flex',gap:8,marginTop:14}}>
              <button className="btn bPr" style={{flex:1,justifyContent:'center'}} onClick={enhance} disabled={loading||!content.trim()}>
                {loading?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Wand2 size={13}/>}
                {loading?'Enhancing...':'Enhance with AI'}
              </button>
              <button className="btn bGr" style={{justifyContent:'center'}} onClick={save}><Save size={13}/> Save</button>
            </div>
          </div>

          {/* Preview side */}
          <div>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              {['write','enhanced'].map(v=>(
                <button key={v} onClick={()=>setView(v)} style={{padding:'5px 12px',borderRadius:8,fontSize:11,fontWeight:600,border:'1px solid',cursor:'pointer',transition:'all .15s',
                  borderColor:view===v?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.07)',
                  background:view===v?'rgba(249,115,22,0.08)':'transparent',color:view===v?'#f97316':'#64748b'}}>
                  {v==='write'?'Original':'✨ AI Enhanced'}
                </button>
              ))}
            </div>
            <div className="glass-d" style={{padding:20,borderRadius:12,minHeight:370,maxHeight:420,overflowY:'auto'}}>
              {view==='enhanced'&&enhanced
                ?<div className="prose-ai"><ReactMarkdown>{enhanced}</ReactMarkdown></div>
                :content?<pre style={{fontSize:13,color:'#94a3b8',whiteSpace:'pre-wrap',fontFamily:'Exo 2, sans-serif',lineHeight:1.7}}>{content}</pre>
                :<div style={{color:'#334155',fontSize:13,textAlign:'center',marginTop:60}}>Write notes on the left to see preview here</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
