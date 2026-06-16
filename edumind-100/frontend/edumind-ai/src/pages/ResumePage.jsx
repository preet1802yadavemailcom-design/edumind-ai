import {useState} from 'react'
import {useGame} from '../lib/store'
import {analyzeResumeAPI} from '../lib/api'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import {FileText,Loader,Clipboard} from 'lucide-react'

export default function ResumePage(){
  const{addXP}=useGame()
  const[resume,setResume]=useState('')
  const[jd,setJd]=useState('')
  const[result,setResult]=useState('')
  const[loading,setLoading]=useState(false)

  async function analyze(){
    if(!resume.trim()||resume.length<100) return toast.error('Paste your full resume text!')
    setLoading(true)
    try{
      const r=await analyzeResumeAPI(resume,jd)
      setResult(r)
      addXP(25,'resume_analyzed')
      toast.success('Resume analyzed! +25 XP 📄')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }

  return(
    <div className="page">
      <div className="sec-h">
        <div className="ico" style={{background:'rgba(132,204,22,0.1)',border:'1px solid rgba(132,204,22,0.2)'}}><FileText size={18} style={{color:'#84cc16'}}/></div>
        <div><h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Resume Analyzer</h1><p style={{fontSize:12,color:'#475569',marginTop:2}}>ATS score + detailed feedback</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div>
            <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>YOUR RESUME (paste full text)</label>
            <textarea className="inp" placeholder="Paste your complete resume here..." value={resume} onChange={e=>setResume(e.target.value)} style={{minHeight:280,fontSize:12}}/>
          </div>
          <div>
            <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6,fontFamily:'monospace'}}>JOB DESCRIPTION (optional)</label>
            <textarea className="inp" placeholder="Paste job description for targeted analysis..." value={jd} onChange={e=>setJd(e.target.value)} style={{minHeight:100,fontSize:12}}/>
          </div>
          <button className="btn bLg" style={{justifyContent:'center',background:'rgba(132,204,22,0.1)',border:'1px solid rgba(132,204,22,0.25)',color:'#84cc16'}} onClick={analyze} disabled={loading||!resume.trim()}>
            {loading?<Loader size={14} style={{animation:'spin 1s linear infinite'}}/>:<FileText size={14}/>}
            {loading?'Analyzing...':'Analyze Resume'}
          </button>
        </div>
        <div className="glass-d" style={{padding:24,borderRadius:16,minHeight:400,maxHeight:600,overflowY:'auto'}}>
          {result
            ?<div className="prose-ai"><ReactMarkdown>{result}</ReactMarkdown></div>
            :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,color:'#334155',gap:10}}>
              <Clipboard size={32} style={{color:'#334155'}}/>
              <p style={{fontSize:13}}>ATS score, keyword analysis and improvement tips will appear here</p>
            </div>}
        </div>
      </div>
    </div>
  )
}
