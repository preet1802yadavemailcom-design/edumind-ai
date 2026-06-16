import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import {useAuth} from './lib/store'
import {Suspense,lazy} from 'react'

// AUTH
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'

// PUBLIC PAGES (no auth needed)
import LandingPage from './pages/public-site/LandingPage'
import {AboutPage,FounderPage,ContactPage,CareersPage,FAQPage,BlogPage,NotFoundPage,PartnersPage} from './pages/public-site/PublicPages'
import {PrivacyPage,TermsPage,RefundPage,CookiePage,DMCAPage} from './pages/public-site/LegalPages'

// APP (auth required)
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'

const S=(f)=>lazy(f)
const AGIMentorPage=S(()=>import('./pages/AGIMentorPage'))
const QuizPage=S(()=>import('./pages/QuizPage'))
const NotesPage=S(()=>import('./pages/NotesPage'))
const FlashcardsPage=S(()=>import('./pages/FlashcardsPage'))
const ResearchPage=S(()=>import('./pages/ResearchPage'))
const InterviewPage=S(()=>import('./pages/InterviewPage'))
const ResumePage=S(()=>import('./pages/ResumePage'))
const SchedulePage=S(()=>import('./pages/SchedulePage'))
const getPage=(n)=>S(()=>import('./pages/AllPages').then(m=>({default:m[n]||m.FallbackPage})))

const DigitalTwinPage=getPage('DigitalTwinPage')
const PredictivePage=getPage('PredictivePage')
const GamifiedWorldPage=getPage('GamifiedWorldPage')
const StartupLabPage=getPage('StartupLabPage')
const TopicExplainerPage=getPage('TopicExplainerPage')
const VoiceSolverPage=getPage('VoicePage')
const LeaderboardPage=getPage('LeaderboardPage')
const AdaptiveRecapPage=getPage('AdaptiveRecapPage')
const NeuralMappingPage=getPage('NeuralMappingPage')
const InstitutionPage=getPage('InstitutionPage')
const ExamPage=getPage('ExamPage')
const GlobalUniversityPage=getPage('GlobalUniversityPage')
const BioHackingPage=getPage('BioHackingPage')
const CybersecurityPage=getPage('CybersecurityPage')
const SatellitePage=getPage('SatellitePage')
const MemoryOptimizerPage=getPage('MemoryOptimizerPage')
const HolographicPage=getPage('HolographicPage')
const MetaverseCampusPage=getPage('MetaverseCampusPage')
const QuantumSyncPage=getPage('QuantumSyncPage')
const KnowledgeGraphPage=getPage('KnowledgeGraphPage')
const DiagramPage=getPage('DiagramPage')
const PastPaperPage=getPage('PastPaperPage')
const FormulaSheetPage=getPage('FormulaSheetPage')
const TextbookPage=getPage('TextbookPage')
const QuizRoomPage=getPage('QuizRoomPage')
const ReportCardsPage=getPage('ReportCardsPage')
const AITutorPage=getPage('AITutorPage')
const AutoCourseCreatorPage=getPage('AutoCourseCreatorPage')
const AttentionDetectionPage=getPage('AttentionDetectionPage')
const KnowledgeSwapPage=getPage('KnowledgeSwapPage')
const AIAssistantPage=getPage('AIAssistantPage')

function Spin(){
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12,background:'#030712'}}>
      <div style={{width:32,height:32,border:'2px solid rgba(0,212,255,0.15)',borderTop:'2px solid #00d4ff',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <span style={{fontSize:12,color:'#475569',fontFamily:'monospace'}}>Loading...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
const W=(C)=><Suspense fallback={<Spin/>}><C/></Suspense>
const WP=(props)=>{const C=props.component;return <Suspense fallback={<Spin/>}><C {...props}/></Suspense>}

function RequireAuth({children}){
  const{isAuth}=useAuth()
  return isAuth?children:<Navigate to="/auth" replace/>
}
function RequireOnboard({children}){
  const{isAuth,onboarded}=useAuth()
  if(!isAuth) return <Navigate to="/auth" replace/>
  if(!onboarded) return <Navigate to="/onboarding" replace/>
  return children
}
function RedirectIfAuth({children}){
  const{isAuth,onboarded}=useAuth()
  if(isAuth&&onboarded) return <Navigate to="/dashboard" replace/>
  return children
}

export default function App(){
  return(
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{style:{background:'#0f172a',border:'1px solid rgba(0,212,255,0.2)',color:'#e2e8f0',fontSize:13,borderRadius:10},success:{iconTheme:{primary:'#00ff88',secondary:'#0f172a'}},error:{iconTheme:{primary:'#ef4444',secondary:'#0f172a'}}}}/>
      <Routes>
        {/* PUBLIC — no auth needed */}
        <Route path="/" element={<RedirectIfAuth><LandingPage/></RedirectIfAuth>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/founder" element={<FounderPage/>}/>
        <Route path="/contact" element={<ContactPage/>}/>
        <Route path="/careers" element={<CareersPage/>}/>
        <Route path="/faq" element={<FAQPage/>}/>
        <Route path="/blog" element={<BlogPage/>}/>
        <Route path="/partners" element={<PartnersPage/>}/>
        {/* LEGAL */}
        <Route path="/privacy" element={<PrivacyPage/>}/>
        <Route path="/terms" element={<TermsPage/>}/>
        <Route path="/refund" element={<RefundPage/>}/>
        <Route path="/cookie" element={<CookiePage/>}/>
        <Route path="/dmca" element={<DMCAPage/>}/>
        {/* AUTH */}
        <Route path="/auth" element={<AuthPage/>}/>
        <Route path="/onboarding" element={<RequireAuth><OnboardingPage/></RequireAuth>}/>
        {/* APP — auth + onboarding required */}
        <Route path="/" element={<RequireOnboard><Layout/></RequireOnboard>}>
          <Route path="dashboard" element={<Dashboard/>}/>
          <Route path="agi-mentor" element={W(AGIMentorPage)}/>
          <Route path="quiz" element={W(QuizPage)}/>
          <Route path="notes" element={W(NotesPage)}/>
          <Route path="flashcards" element={W(FlashcardsPage)}/>
          <Route path="research-agent" element={W(ResearchPage)}/>
          <Route path="ai-interview" element={W(InterviewPage)}/>
          <Route path="ai-interview/:type" element={W(InterviewPage)}/>
          <Route path="resume" element={W(ResumePage)}/>
          <Route path="schedule" element={W(SchedulePage)}/>
          <Route path="digital-twin" element={W(DigitalTwinPage)}/>
          <Route path="predictive" element={W(PredictivePage)}/>
          <Route path="gamified-world" element={W(GamifiedWorldPage)}/>
          <Route path="gamified-world/:sub" element={W(GamifiedWorldPage)}/>
          <Route path="startup-lab" element={W(StartupLabPage)}/>
          <Route path="startup-lab/:sub" element={W(StartupLabPage)}/>
          <Route path="topic-explainer" element={W(TopicExplainerPage)}/>
          <Route path="voice-solver" element={W(VoiceSolverPage)}/>
          <Route path="leaderboard" element={W(LeaderboardPage)}/>
          <Route path="adaptive-recap" element={W(AdaptiveRecapPage)}/>
          <Route path="neural-mapping" element={W(NeuralMappingPage)}/>
          <Route path="institution" element={W(InstitutionPage)}/>
          <Route path="institution/:sub" element={W(InstitutionPage)}/>
          <Route path="exam" element={W(ExamPage)}/>
          <Route path="exam/:sub" element={W(ExamPage)}/>
          <Route path="global-university" element={W(GlobalUniversityPage)}/>
          <Route path="bio-hacking" element={W(BioHackingPage)}/>
          <Route path="cybersecurity" element={W(CybersecurityPage)}/>
          <Route path="satellite" element={W(SatellitePage)}/>
          <Route path="memory-optimizer" element={W(MemoryOptimizerPage)}/>
          <Route path="holographic" element={W(HolographicPage)}/>
          <Route path="metaverse-campus" element={W(MetaverseCampusPage)}/>
          <Route path="quantum-sync" element={W(QuantumSyncPage)}/>
          <Route path="knowledge-graph" element={W(KnowledgeGraphPage)}/>
          <Route path="diagram" element={W(DiagramPage)}/>
          <Route path="past-papers" element={W(PastPaperPage)}/>
          <Route path="formula-sheet" element={W(FormulaSheetPage)}/>
          <Route path="textbook" element={W(TextbookPage)}/>
          <Route path="quiz-room" element={W(QuizRoomPage)}/>
          <Route path="report-cards" element={W(ReportCardsPage)}/>
          <Route path="ai-tutor" element={W(AITutorPage)}/>
          <Route path="course-creator" element={W(AutoCourseCreatorPage)}/>
          <Route path="attention-detection" element={W(AttentionDetectionPage)}/>
          <Route path="knowledge-swap" element={W(KnowledgeSwapPage)}/>
          <Route path="ai-assistant" element={W(AIAssistantPage)}/>
        </Route>
        {/* 404 */}
        <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

