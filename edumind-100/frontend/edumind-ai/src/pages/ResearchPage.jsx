import {useState} from 'react'
import {useGame} from '../lib/store'
import {researchAPI} from '../lib/api'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {Globe,Loader,ExternalLink,Newspaper,Search} from 'lucide-react'

const SAMPLE=['Latest AI breakthroughs 2024','Climate change solutions','Quantum computing applications','CRISPR gene editing advances','Blockchain in education','Space colonization plans']

export default function ResearchPage(){
  const{addXP}=useGame()
  const[query,setQuery]=useState('')
  const[depth,setDepth]=useState('standard')
  const[result,setResult]=useState(null)
  const[loading,setLoading]=useState(false)

  async function research(q){
    const topic=(q||query).trim()
    if(!topic) return toast.error('Enter a research topic!')
    setLoading(true);setResult(null)
    try{
      const r=await researchAPI(topic,depth)
      setResult(r)
      addXP(30,'research_done')
      toast.success('Research complete! +30 XP 🔬')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(20,184,166,0.1)',border:'1px solid rgba(20,184,166,0.2)'}}><Globe size={18} style={{color:'#14b8a6'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Research Agent</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>Real-time web search + AI synthesis</p></div>
      </div>

      <div className="glass-d" style={{padding:20,borderRadius:16,marginBottom:20}}>
        <div style={{display:'flex',gap:10,marginBottom:12}}>
          <div style={{position:'relative',flex:1}}>
            <Search size={14} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#475569'}}/>
            <input className="inp" placeholder="Research any topic..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&research()} style={{paddingLeft:36}}/>
          </div>
          <div style={{display:'flex',gap:6}}>
            {['standard','deep'].map(d=>(
              <button key={d} onClick={()=>setDepth(d)} style={{padding:'0 16px',borderRadius:9,fontSize:11,fontWeight:600,border:'1px solid',cursor:'pointer',transition:'all .15s',textTransform:'capitalize',
                borderColor:depth===d?'rgba(20,184,166,0.4)':'rgba(255,255,255,0.07)',
                background:depth===d?'rgba(20,184,166,0.1)':'transparent',color:depth===d?'#14b8a6':'#64748b'}}>
                {d}
              </button>
            ))}
          </div>
          <button className="btn bLg" style={{background:'rgba(20,184,166,0.12)',border:'1px solid rgba(20,184,166,0.25)',color:'#14b8a6'}} onClick={()=>research()} disabled={loading||!query.trim()}>
            {loading?<Loader size={14} style={{animation:'spin 1s linear infinite'}}/>:<Globe size={14}/>}
            {loading?'Researching...':'Research'}
          </button>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {SAMPLE.map(s=>(
            <button key={s} onClick={()=>{setQuery(s);research(s)}}
              style={{padding:'4px 10px',borderRadius:16,fontSize:11,border:'1px solid rgba(20,184,166,0.15)',background:'transparent',color:'#475569',cursor:'pointer',transition:'all .15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#14b8a6'} onMouseLeave={e=>e.currentTarget.style.color='#475569'}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading&&(
        <div className="glass-d" style={{padding:40,borderRadius:16,textAlign:'center'}}>
          <Loader size={28} style={{color:'#14b8a6',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
          <p style={{fontSize:13,color:'#475569'}}>Searching the web + synthesizing with AI...</p>
          <p style={{fontSize:11,color:'#334155',marginTop:4}}>Using Tavily AI Search + {depth==='deep'?'8':'5'} sources</p>
        </div>
      )}

      {result&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:16}}>
          <div className="glass-d" style={{padding:24,borderRadius:16,maxHeight:600,overflowY:'auto'}}>
            <div className="prose-ai"><ReactMarkdown>{result.result}</ReactMarkdown></div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {result.news?.length>0&&(
              <div className="glass-d" style={{padding:16,borderRadius:12}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                  <Newspaper size={13} style={{color:'#14b8a6'}}/><span style={{fontSize:11,color:'#64748b',fontFamily:'monospace'}}>LATEST NEWS</span>
                </div>
                {result.news.map((n,i)=>(
                  <div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<result.news.length-1?'1px solid rgba(255,255,255,0.04)':'none'}}>
                    <div style={{fontSize:11,fontWeight:600,color:'#e2e8f0',marginBottom:3,lineHeight:1.4}}>{n.title}</div>
                    <div style={{fontSize:10,color:'#475569'}}>{n.description?.slice(0,100)}...</div>
                  </div>
                ))}
              </div>
            )}
            {result.sources?.length>0&&(
              <div className="glass-d" style={{padding:16,borderRadius:12}}>
                <div style={{fontSize:11,color:'#64748b',fontFamily:'monospace',marginBottom:10}}>SOURCES</div>
                {result.sources.map((s,i)=>(
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'flex-start',gap:6,marginBottom:8,textDecoration:'none',padding:'6px 8px',borderRadius:6,background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.04)',transition:'background .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(20,184,166,0.06)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
                    <ExternalLink size={10} style={{color:'#14b8a6',marginTop:2,flexShrink:0}}/>
                    <span style={{fontSize:10,color:'#64748b',lineHeight:1.4}}>{s.title||s.url}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
