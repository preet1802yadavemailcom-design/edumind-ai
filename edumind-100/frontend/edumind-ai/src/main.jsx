import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Error boundary for production
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(e) { return { hasError: true, error: e } }
  render() {
    if (this.state.hasError) return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:16,background:'#030712',color:'#e2e8f0',padding:20,textAlign:'center'}}>
        <div style={{fontSize:48}}>⚠️</div>
        <h2 style={{fontSize:20,fontWeight:700}}>Something went wrong</h2>
        <p style={{fontSize:13,color:'#64748b',maxWidth:400}}>{this.state.error?.message}</p>
        <button onClick={()=>window.location.reload()} style={{padding:'9px 20px',borderRadius:10,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.2)',color:'#00d4ff',cursor:'pointer',fontSize:13}}>
          Reload App
        </button>
      </div>
    )
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
