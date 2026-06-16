import {useEffect,useRef} from 'react'
export default function NeuralCanvas(){
  const ref=useRef(null),raf=useRef(null)
  useEffect(()=>{
    const c=ref.current;if(!c)return
    const ctx=c.getContext('2d')
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight}
    resize();window.addEventListener('resize',resize)
    const N=65,nodes=Array.from({length:N},()=>({
      x:Math.random()*c.width,y:Math.random()*c.height,
      vx:(Math.random()-.5)*.42,vy:(Math.random()-.5)*.42,
      r:Math.random()*1.6+.5,phase:Math.random()*Math.PI*2,
      col:['#00d4ff','#7c3aed','#ffd700','#00ff88'][Math.floor(Math.random()*4)],
    }))
    let f=0
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);f++
      nodes.forEach(n=>{
        n.x+=n.vx;n.y+=n.vy
        if(n.x<0||n.x>c.width)n.vx*=-1;if(n.y<0||n.y>c.height)n.vy*=-1
        const p=Math.sin(f*.018+n.phase)*.5+.5
        ctx.beginPath();ctx.arc(n.x,n.y,n.r*(1+p*.5),0,Math.PI*2)
        ctx.fillStyle=n.col;ctx.globalAlpha=.12+p*.22;ctx.fill();ctx.globalAlpha=1
      })
      for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
        const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<130){
          const g=ctx.createLinearGradient(nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y)
          g.addColorStop(0,nodes[i].col);g.addColorStop(1,nodes[j].col)
          ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y)
          ctx.strokeStyle=g;ctx.globalAlpha=(1-d/130)*.08;ctx.lineWidth=.55;ctx.stroke();ctx.globalAlpha=1
        }
      }
      raf.current=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" style={{opacity:.52}}/>
}