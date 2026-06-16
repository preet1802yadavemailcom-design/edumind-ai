import {useNavigate} from 'react-router-dom'
export function PH({icon:Icon,color,title,desc,badge,children,extra}){
  const nav=useNavigate()
  return(
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{background:`${color}14`,border:`1px solid ${color}24`}}>
        <Icon size={22} style={{color}}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-display text-xl font-black" style={{color:'#e2e8f0'}}>{title}</h1>
          {badge&&<span className="bdg bB">{badge}</span>}
        </div>
        {desc&&<p className="text-sm mt-0.5" style={{color:'#64748b'}}>{desc}</p>}
      </div>
      {extra&&<div className="flex items-center gap-2">{extra}</div>}
      {children}
    </div>
  )
}
export function AIBox({content,loading,title}){
  if(loading)return(
    <div className="card-f p-4"><div className="thinking"><span/><span/><span/>
      <span className="text-xs ml-2" style={{color:'#475569'}}>Groq AI thinking...</span>
    </div></div>
  )
  if(!content)return null
  return(
    <div className="card-f p-4">
      {title&&<div className="font-display text-xs font-bold mb-3 tracking-wide" style={{color:'#00d4ff'}}>{title}</div>}
      <div className="chatA" style={{border:'none',background:'transparent',padding:0}}>
        <pre className="whitespace-pre-wrap text-sm" style={{color:'#94a3b8',fontFamily:'inherit',lineHeight:1.7}}>{content}</pre>
      </div>
    </div>
  )
}