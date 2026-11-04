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
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-top"><Label>{profile.location}</Label></div>
    <div className="hero-copy">
      <h1 id="hero-title">C Kaustubh</h1>
      <p className="page-intro">Computer Science student at PES University.<br/>AI Intern at Together Fund.</p>
      <p className="hero-summary">I build AI products, work on speech recognition research, and write systems software.</p>
      <div className="contact-links"><a href="#work">Projects ↓</a><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Résumé <Arrow/></a></div>
    </div>
  </section>;
}

function ProjectRows() {
  return <div className="project-list">{projects.map(p => <article className="project-row" key={p.id}>
    <span className="project-rank">{String(p.id).padStart(2,'0')}</span>
    <div><Label>{p.category}</Label><h3>{p.name}</h3><p>{p.description}</p><span className="project-tags">{p.tags}</span></div>
    <a className="repo-link" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${p.name} repository`}>Source <Arrow/></a>
  </article>)}</div>;
}

function Work() {
  return <section id="work" className="section work">
    <div className="section-title"><h2>Projects</h2><a className="text-link" href="https://github.com/snigenigmatic" target="_blank" rel="noopener noreferrer">GitHub <Arrow/></a></div>
    <ProjectRows/>
  </section>;
}

function Experience() {
  return <section className="section experience">
    <h2>Experience</h2>
    <div className="experience-list">{profile.experience.map((e,i) => <article className="experience-row" key={e.company}>
      <span className="eyebrow row-number">{String(i+1).padStart(2,'0')}</span>
      <div><h3>{e.company}</h3><p className="muted">{e.role}</p></div>
      <p className="experience-copy">{e.description}</p><span className="date">{e.dates}</span>
    </article>)}</div>
  </section>;
}

function Contributions() {
  return <section className="section contributions"><h2>Open source</h2>
    {profile.contributions.map(c => <article className="contribution-row" key={c.name}><h3>{c.name}</h3><p>{c.description}</p></article>)}
  </section>;
}

function Education() {
  const e = profile.education;
  return <section className="section education"><h2>Education</h2>
    <div className="education-row"><div><h3>{e.institution}</h3><p>{e.degree}</p><p className="muted">CGPA: {e.cgpa}</p></div><span className="date">{e.dates}</span></div>
  </section>;
}

function Footer() {
  return <><section className="contact-section" id="contact"><h2>Contact</h2>
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
  return <main id="main" className="section inner-page about-page"><h1>About</h1><div className="prose"><React.Suspense fallback={<p>Loading…</p>}><AboutContent/></React.Suspense></div></main>;
}

function ContactPage() {
  return <main id="main" className="section inner-page contact-page"><h1>Contact</h1><p className="page-intro">{profile.location}</p><a className="button" href={email}>{profile.email} <Arrow/></a><div className="contact-links"><a href="https://github.com/snigenigmatic">GitHub <Arrow/></a><a href="https://linkedin.com/in/c-kaustubh">LinkedIn <Arrow/></a></div></main>;
}

function ResumePage() {
  return <main id="main" className="section inner-page"><h1>Résumé</h1><a className="button" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open PDF <Arrow/></a><a className="text-link resume-download" href="/resume.pdf" download="C-Kaustubh-Resume.pdf">Download ↓</a><object className="resume-viewer" data="/resume.pdf" type="application/pdf" aria-label="C Kaustubh résumé"><p><a href="/resume.pdf">Read the résumé PDF</a></p></object></main>;
}

function App() {
  const path = window.location.pathname;
  const page = path.includes('projects') ? <ProjectPage/> : path.includes('about') ? <AboutPage/> : path.includes('resume') ? <ResumePage/> : path.includes('contact') ? <ContactPage/> : <main id="main"><Hero/><Experience/><Work/><Contributions/><Education/></main>;
  return <MotionConfig reducedMotion="user" transition={{duration:.18,ease:[.2,0,0,1]}}><a className="skip-link" href="#main">Skip to content</a><div id="top"/><Header/>{page}<Footer/></MotionConfig>;
}
createRoot(document.getElementById('root')).render(<App/>);
