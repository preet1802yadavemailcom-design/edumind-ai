import {useNavigate} from 'react-router-dom'
import {ArrowLeft,Shield,FileText,Cookie,RotateCcw,XCircle,AlertTriangle,Lock} from 'lucide-react'

function LegalLayout({icon:I,color,title,lastUpdated,children}){
  const nav=useNavigate()
  return(
    <div style={{minHeight:'100vh',background:'#030712',color:'#e2e8f0',fontFamily:'Exo 2, sans-serif'}}>
      <nav style={{borderBottom:'0.5px solid rgba(255,255,255,0.06)',padding:'0 5%',height:56,display:'flex',alignItems:'center',gap:12}}>
        <button onClick={()=>nav('/')} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:13}}>
          <ArrowLeft size={14}/> Back to EduMind AI
        </button>
      </nav>
      <div style={{maxWidth:800,margin:'0 auto',padding:'48px 5%'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <div style={{width:40,height:40,borderRadius:10,background:`${color}15`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <I size={20} style={{color}}/>
          </div>
          <h1 style={{fontSize:28,fontWeight:700,color:'#e2e8f0'}}>{title}</h1>
        </div>
        <p style={{fontSize:12,color:'#475569',marginBottom:32,fontFamily:'monospace'}}>Last updated: {lastUpdated} · EduMind AI · edu-mind.app</p>
        <div style={{fontSize:14,lineHeight:1.85,color:'#94a3b8'}}>{children}</div>
        <div style={{marginTop:40,padding:'16px 20px',borderRadius:10,background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.06)',fontSize:12,color:'#475569'}}>
          Questions? Contact us at <span style={{color:'#00d4ff'}}>legal@edu-mind.app</span> or visit <span style={{color:'#00d4ff'}}>preetbeacon.com</span>
        </div>
      </div>
    </div>
  )
}

function Section({title,children}){
  return <div style={{marginBottom:28}}><h2 style={{fontSize:16,fontWeight:700,color:'#e2e8f0',marginBottom:10,paddingBottom:6,borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>{title}</h2>{children}</div>
}
function P({children}){return <p style={{marginBottom:12}}>{children}</p>}
function Li({children}){return <li style={{marginBottom:6,paddingLeft:4}}>{children}</li>}
function Ul({children}){return <ul style={{paddingLeft:20,marginBottom:12}}>{children}</ul>}

export function PrivacyPage(){
  return(
    <LegalLayout icon={Shield} color="#00d4ff" title="Privacy Policy" lastUpdated="June 7, 2026">
      <Section title="Introduction">
        <P>EduMind AI ("we", "us", "our") is operated by Preet Yadav under Preet Beacon. This Privacy Policy explains how we collect, use, and protect your information when you use edu-mind.app.</P>
        <P>By using EduMind AI, you agree to the collection and use of information in accordance with this policy. We are committed to protecting your privacy and complying with applicable data protection laws including GDPR and Indian IT Act 2000.</P>
      </Section>
      <Section title="Information We Collect">
        <Ul>
          <Li><strong style={{color:'#e2e8f0'}}>Account data:</strong> Name, email, password (hashed with bcrypt — never stored in plain text), field of study, career goals</Li>
          <Li><strong style={{color:'#e2e8f0'}}>Usage data:</strong> Modules used, quiz scores, study sessions, XP earned — used to personalize your experience</Li>
          <Li><strong style={{color:'#e2e8f0'}}>Device data:</strong> Browser type, IP address, device type — used for security and analytics only</Li>
          <Li><strong style={{color:'#e2e8f0'}}>AI interaction data:</strong> Questions asked to AI (processed but not permanently stored for training without consent)</Li>
        </Ul>
      </Section>
      <Section title="How We Use Your Data">
        <Ul>
          <Li>Provide and improve the EduMind AI platform</Li>
          <Li>Personalize your learning experience</Li>
          <Li>Send important account updates (not spam)</Li>
          <Li>Analyze usage patterns to improve features</Li>
          <Li>Ensure platform security and prevent abuse</Li>
        </Ul>
      </Section>
      <Section title="Data Security">
        <P>We implement industry-standard security: bcrypt password hashing, JWT authentication, HTTPS encryption, rate limiting, and server-side API key storage. Your API interactions go through our secure backend — your data never directly touches third-party AI providers without our encryption layer.</P>
      </Section>
      <Section title="Third-Party Services">
        <P>We use: Neon (database), Upstash (caching), Groq/Gemini/etc. (AI processing), Cloudinary (file storage), Resend (email). Each follows their own privacy policies. We only share minimum necessary data.</P>
      </Section>
      <Section title="Your Rights (GDPR & India)">
        <Ul>
          <Li>Right to access your data — email legal@edu-mind.app</Li>
          <Li>Right to delete your account and data — Settings → Delete Account</Li>
          <Li>Right to data portability — request export via email</Li>
          <Li>Right to opt out of marketing emails — unsubscribe link in every email</Li>
        </Ul>
      </Section>
      <Section title="Contact">
        <P>Privacy Officer: Preet Yadav · legal@edu-mind.app · Preet Beacon, Uttar Pradesh, India</P>
      </Section>
    </LegalLayout>
  )
}

export function TermsPage(){
  return(
    <LegalLayout icon={FileText} color="#7c3aed" title="Terms & Conditions" lastUpdated="June 7, 2026">
      <Section title="Acceptance of Terms">
        <P>By accessing or using EduMind AI at edu-mind.app, you agree to be bound by these Terms and Conditions. If you disagree, please do not use the platform. These terms are governed by the laws of India.</P>
      </Section>
      <Section title="Use of Service">
        <P>EduMind AI is an AI-powered education platform. You agree to:</P>
        <Ul>
          <Li>Use the platform only for lawful educational purposes</Li>
          <Li>Not attempt to reverse-engineer, scrape, or abuse our APIs</Li>
          <Li>Not share your account credentials with others</Li>
          <Li>Not use AI features to generate harmful, illegal, or misleading content</Li>
          <Li>Be at least 13 years old to use the platform</Li>
        </Ul>
      </Section>
      <Section title="Free vs Pro Tier">
        <P>Free tier includes 20 AI queries/day and basic features. Pro tier (₹199/month) unlocks unlimited queries and all 22 modules. We reserve the right to adjust free tier limits with 30 days notice.</P>
      </Section>
      <Section title="Intellectual Property">
        <P>EduMind AI, its branding, code, and content are the intellectual property of Preet Yadav / Preet Beacon. AI-generated content based on your prompts is yours. Our proprietary AI routing system, UI design, and platform architecture are protected.</P>
      </Section>
      <Section title="Disclaimer">
        <P>AI responses are generated by third-party models and may occasionally be incorrect. EduMind AI is not responsible for decisions made based on AI outputs. Always verify important information from authoritative sources.</P>
      </Section>
      <Section title="Termination">
        <P>We may suspend accounts that violate these terms. You may delete your account anytime from Settings. Upon deletion, your data is removed within 30 days.</P>
      </Section>
      <Section title="Contact">
        <P>Preet Yadav · legal@edu-mind.app · edu-mind.app · Preet Beacon</P>
      </Section>
    </LegalLayout>
  )
}

export function RefundPage(){
  return(
    <LegalLayout icon={RotateCcw} color="#00ff88" title="Refund Policy" lastUpdated="June 7, 2026">
      <Section title="Refund Eligibility">
        <P>We offer a 7-day full refund guarantee on Pro subscriptions. If you are not satisfied within 7 days of purchase, contact us for a complete refund — no questions asked.</P>
      </Section>
      <Section title="How to Request a Refund">
        <Ul>
          <Li>Email: billing@edu-mind.app within 7 days of purchase</Li>
          <Li>Subject: "Refund Request — [your email]"</Li>
          <Li>Include: Order ID from your payment confirmation</Li>
          <Li>Processing time: 5-7 business days to original payment method</Li>
        </Ul>
      </Section>
      <Section title="Non-Refundable Cases">
        <Ul>
          <Li>Requests after 7 days of purchase</Li>
          <Li>Accounts suspended for Terms of Service violations</Li>
          <Li>Annual subscriptions after 30 days (partial refund possible)</Li>
        </Ul>
      </Section>
      <Section title="Institution Plans">
        <P>Institution plans are non-refundable after 14 days or after team member invitations have been sent. Contact sales@edu-mind.app for enterprise refund discussions.</P>
      </Section>
    </LegalLayout>
  )
}

export function CookiePage(){
  return(
    <LegalLayout icon={Cookie} color="#f97316" title="Cookie Policy" lastUpdated="June 7, 2026">
      <Section title="What Are Cookies">
        <P>Cookies are small text files stored on your device. EduMind AI uses minimal cookies — only what is essential for the platform to function.</P>
      </Section>
      <Section title="Cookies We Use">
        <Ul>
          <Li><strong style={{color:'#e2e8f0'}}>Auth token (essential):</strong> Keeps you logged in. Expires in 7 days. Cannot be disabled.</Li>
          <Li><strong style={{color:'#e2e8f0'}}>Preferences (functional):</strong> Stores dark mode, language, persona settings.</Li>
          <Li><strong style={{color:'#e2e8f0'}}>Analytics (optional):</strong> Simple Analytics — privacy-friendly, no personal data, can be opted out.</Li>
        </Ul>
      </Section>
      <Section title="We Do NOT Use">
        <Ul>
          <Li>Facebook/Google advertising pixels</Li>
          <Li>Cross-site tracking cookies</Li>
          <Li>Third-party ad network cookies</Li>
        </Ul>
      </Section>
      <Section title="Managing Cookies">
        <P>You can clear cookies in your browser settings. Clearing auth cookies will log you out. EduMind AI respects your Do Not Track browser settings.</P>
      </Section>
    </LegalLayout>
  )
}

export function DMCAPage(){
  return(
    <LegalLayout icon={AlertTriangle} color="#ef4444" title="DMCA Policy" lastUpdated="June 7, 2026">
      <Section title="Copyright Notice">
        <P>EduMind AI respects intellectual property rights and expects users to do the same. We will respond to notices of alleged copyright infringement that comply with applicable law.</P>
      </Section>
      <Section title="Reporting Copyright Infringement">
        <P>If you believe content on EduMind AI infringes your copyright, send a DMCA notice to: dmca@edu-mind.app with:</P>
        <Ul>
          <Li>Your contact information</Li>
          <Li>Identification of the copyrighted work</Li>
          <Li>Identification of the allegedly infringing material</Li>
          <Li>Statement of good faith belief</Li>
          <Li>Statement of accuracy under penalty of perjury</Li>
          <Li>Your physical or electronic signature</Li>
        </Ul>
      </Section>
      <Section title="Response">
        <P>We will investigate and respond within 3-5 business days. If valid, we will remove or disable access to the infringing content.</P>
      </Section>
    </LegalLayout>
  )
}
