import React, {useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {motion, AnimatePresence, MotionConfig} from 'motion/react';
import {projects} from './data';
import profile from '../content/profile.json';
import './style.css';

const AboutContent = React.lazy(() => import('./AboutContent.jsx'));
const Arrow = () => <span aria-hidden="true">↗</span>;
const Label = ({children}) => <span className="eyebrow">{children}</span>;
const email = `mailto:${profile.email}`;

function Mark() {
  return <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M10 9v22M30 9 18 20l12 11M8 20h10" fill="none" stroke="currentColor" strokeWidth="3"/><circle cx="33" cy="7" r="3" fill="var(--orange)"/></svg>;
}

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  return <header className="header">
    <a className="brand" href="/" aria-label="C Kaustubh home"><Mark/><span>C Kaustubh</span></a>
    <nav className="desktop-nav" aria-label="Main navigation">
      <a href="/projects.html">Projects</a><a href="/about.html">About</a><a href="/resume.html">Résumé <Arrow/></a>
    </nav>
    <a className="header-contact" href={email}>Email <Arrow/></a>
    <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? 'Close −' : 'Menu +'}</button>
    <AnimatePresence>{open && <motion.nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <a href="/projects.html">Projects</a><a href="/about.html">About</a><a href="/resume.html">Résumé</a><a href="/contact.html">Contact</a>
    </motion.nav>}</AnimatePresence>
  </header>;
}

function Hero() {
  return <section className="hero personal-hero" aria-labelledby="hero-title">
    <div className="hero-top"><Label>C Kaustubh · {profile.location}</Label><Label>Computer Science · PES ’27</Label></div>
    <div className="personal-intro">
      <div className="personal-copy">
        <p className="hello-note">A little about me</p>
        <h1 id="hero-title">Hi, I’m<br/>Kaustubh<span className="name-period">.</span></h1>
        <p className="personal-lede">I study computer science, build AI products, and work on the systems underneath.</p>
        <p className="personal-motivation">I like understanding how things work well enough to change them. That takes me from speech recognition across Indian accents to CUDA inference and tools for working with AI.</p>
        <div className="contact-links"><a href="#work">See my work ↓</a><a href={email}>Say hello <Arrow/></a></div>
      </div>
      <figure className="personal-portrait"><img src="/Kaustubh.jpg" alt="Kaustubh" width="1368" height="1824" fetchPriority="high"/><figcaption><span>Kaustubh, in person.</span><span>Bengaluru ↗</span></figcaption></figure>
    </div>
    <div className="at-a-glance">
      <div><Label>Now</Label><p>AI Intern <a href="#experience">at Together Fund ↗</a></p></div>
      <div><Label>Studying</Label><p>Computer Science <a href="#education">at PES University ↗</a></p></div>
      <div><Label>Working on</Label><p>Speech research, inference, and AI tools</p></div>
    </div>
  </section>;
}

const interests = [
  {name:'Research', question:'Where does the model get it wrong?', copy:'I work on speech recognition across Indian accents and uncertainty in language models. I’m interested in where the errors come from, and what the evaluation actually tells us.', project:'ASR fairness & UncertaRAG', href:'#work', kind:'wave'},
  {name:'Systems', question:'What is happening underneath?', copy:'I build lower-level implementations to understand the runtime: custom CUDA kernels for Qwen inference, and fixes for process hangs and deadlocks in open source.', project:'Qwen CUDA, LanceDB & Firecracker', href:'#work', kind:'grid'},
  {name:'Products', question:'How does someone use this?', copy:'At AVEVA, I built an assistant for industrial KPI calculations. At Together Fund, I build AI products and internal automation. LocalLens connects file search to agents and IDEs.', project:'AVEVA, Together Fund & LocalLens', href:'#experience', kind:'nodes'}
];

function InterestDrawing({kind}) {
  return <svg className="interest-drawing" viewBox="0 0 300 160" aria-hidden="true">
    {kind==='wave' ? Array.from({length:8},(_,i)=><path key={i} d={`M 5 ${35+i*12} C 70 ${145-i*12}, 95 ${-40+i*14}, 150 ${70+i*3} S 230 ${150-i*12}, 295 ${25+i*13}`} fill="none" stroke="currentColor" strokeWidth=".8"/>) : kind==='grid' ? <g>{Array.from({length:7},(_,i)=><g key={i}><path d={`M${40+i*30} 20V140M40 ${20+i*20}H220`} fill="none" stroke="currentColor" strokeWidth=".7"/></g>)}<rect x="100" y="60" width="30" height="20" fill="var(--orange)"/><rect x="130" y="80" width="30" height="20" fill="var(--orange)" opacity=".45"/></g> : <g>{[[40,80],[150,30],[150,130],[260,80]].map(([x,y],i)=><g key={i}><path d={`M150 80L${x} ${y}`} fill="none" stroke="currentColor"/><circle cx={x} cy={y} r="13" fill="white" stroke="currentColor"/></g>)}<circle cx="150" cy="80" r="7" fill="var(--orange)"/></g>}
  </svg>;
}

function Interests() {
  const [active,setActive]=useState(0);
  const item=interests[active];
  return <section className="section interests" aria-labelledby="interest-heading">
    <div className="interest-intro"><Label>What keeps me interested</Label><h2 id="interest-heading">The model. The system.<br/>The person using it.</h2><p>My projects sit at different levels of the same problem. These are the questions that connect them.</p></div>
    <div className="interest-explorer">
      <div className="interest-buttons" aria-label="Explore my interests">{interests.map((interest,i)=><button key={interest.name} aria-pressed={active===i} aria-controls="interest-detail" onClick={()=>setActive(i)}><span>0{i+1}</span>{interest.name}</button>)}</div>
      <div className="interest-detail" id="interest-detail" aria-live="polite"><motion.div key={item.name} initial={{opacity:0}} animate={{opacity:1}} className="interest-body"><div><h3>{item.question}</h3><p>{item.copy}</p><a href={item.href}>{item.project} <Arrow/></a></div><InterestDrawing kind={item.kind}/></motion.div></div>
    </div>
  </section>;
}

function ProjectRows() {
  return <div className="project-list">{projects.map(p => <article className="project-row" key={p.id}>
    <span className="project-rank">{String(p.id).padStart(2,'0')}</span>
    <div><Label>{p.category}</Label><h3>{p.name}</h3><p className="project-question">{p.question}</p><p>{p.description}</p><span className="project-tags">{p.tags}</span></div>
    <a className="repo-link" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${p.name} repository`}>Source <Arrow/></a>
  </article>)}</div>;
}

function Work() {
  return <section id="work" className="section work">
    <div className="section-title"><h2>What I’ve built</h2><a className="text-link" href="https://github.com/snigenigmatic" target="_blank" rel="noopener noreferrer">GitHub <Arrow/></a></div>
    <ProjectRows/>
  </section>;
}

function Experience() {
  return <section id="experience" className="section experience">
    <div className="section-title"><h2>Where I’ve worked</h2><span className="section-note">Research, industrial software, and venture.</span></div>
    <div className="experience-list">{profile.experience.map((e,i) => <article className="experience-row" key={e.company}>
      <span className="eyebrow row-number">{String(i+1).padStart(2,'0')}</span>
      <div><h3>{e.company}</h3><p className="muted">{e.role}</p></div>
      <p className="experience-copy">{e.description}</p><span className="date">{e.dates}</span>
    </article>)}</div>
  </section>;
}

function Contributions() {
  return <section className="section contributions"><div className="section-title"><h2>Code I contribute to</h2><span className="section-note">Fixes in projects I work with.</span></div>
    {profile.contributions.map(c => <article className="contribution-row" key={c.name}><h3>{c.name}</h3><p>{c.description}</p></article>)}
  </section>;
}

function Education() {
  const e = profile.education;
  return <section id="education" className="section education"><h2>At PES University</h2>
    <div className="education-row"><div><h3>{e.institution}</h3><p>{e.degree}</p><p className="muted">CGPA: {e.cgpa}</p></div><span className="date">{e.dates}</span></div><div className="campus-note"><Label>Outside the coursework</Label><p>I’m also Tech Lead at Shunya PESU, where I built and maintain the club website using React, TypeScript, and Tailwind.</p><a className="text-link" href="/about.html">More about me <Arrow/></a></div>
  </section>;
}

function Footer() {
  return <><section className="contact-section" id="contact"><h2>Good to meet you.</h2><p className="contact-invite">If you’re working on something related, or want to compare notes, write to me.</p>
    <div className="contact-bottom"><a href={email}>{profile.email} <Arrow/></a><span>{profile.location}</span></div>
  </section><footer className="footer"><span>© {new Date().getFullYear()} C Kaustubh</span>
    <div><a href="https://github.com/snigenigmatic" target="_blank" rel="noopener noreferrer">GitHub <Arrow/></a><a href="https://linkedin.com/in/c-kaustubh" target="_blank" rel="noopener noreferrer">LinkedIn <Arrow/></a><a href="/resume.html">Résumé <Arrow/></a></div>
    <a className="back-top" href="#top" aria-label="Back to top">↑</a>
  </footer></>;
}

function ProjectPage() {
  return <main id="main" className="section inner-page"><h1>Projects</h1><p className="page-intro">Five projects in speech recognition, language models, and AI tools.</p><ProjectRows/></main>;
}

function AboutPage() {
  return <main id="main" className="section inner-page about-page"><h1>About me</h1><p className="about-personal">I like problems where performance, correctness, and practical ML constraints meet. My work spans the model, the software that runs it, and the tools people use around it.</p><div className="prose"><React.Suspense fallback={<p>Loading…</p>}><AboutContent/></React.Suspense></div></main>;
}

function ContactPage() {
  return <main id="main" className="section inner-page contact-page"><h1>Contact</h1><p className="page-intro">{profile.location}</p><a className="button" href={email}>{profile.email} <Arrow/></a><div className="contact-links"><a href="https://github.com/snigenigmatic">GitHub <Arrow/></a><a href="https://linkedin.com/in/c-kaustubh">LinkedIn <Arrow/></a></div></main>;
}

function ResumePage() {
  return <main id="main" className="section inner-page"><h1>Résumé</h1><a className="button" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open PDF <Arrow/></a><a className="text-link resume-download" href="/resume.pdf" download="C-Kaustubh-Resume.pdf">Download ↓</a><object className="resume-viewer" data="/resume.pdf" type="application/pdf" aria-label="C Kaustubh résumé"><p><a href="/resume.pdf">Read the résumé PDF</a></p></object></main>;
}

function App() {
  const path = window.location.pathname;
  const page = path.includes('projects') ? <ProjectPage/> : path.includes('about') ? <AboutPage/> : path.includes('resume') ? <ResumePage/> : path.includes('contact') ? <ContactPage/> : <main id="main"><Hero/><Interests/><Work/><Experience/><Contributions/><Education/></main>;
  return <MotionConfig reducedMotion="user" transition={{duration:.18,ease:[.2,0,0,1]}}><a className="skip-link" href="#main">Skip to content</a><div id="top"/><Header/>{page}<Footer/></MotionConfig>;
}
createRoot(document.getElementById('root')).render(<App/>);
