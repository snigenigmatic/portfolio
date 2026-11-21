import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import profile from '../content/profile.json';
import Icon from './Icon';

export const Arrow = () => <Icon name="arrow"/>;
export const Label = ({children}) => <span className="eyebrow">{children}</span>;
export const email = `mailto:${profile.email}`;
export const isWritingPath = path => path === '/writing/' || path.startsWith('/writing/');
export const isPostPath = path => /^\/writing\/[a-z0-9-]+\/$/.test(path);

function Mark() {
  return <svg viewBox="0 0 40 40" aria-hidden="true" className="personal-mark">
    <path d="M5 7a3 3 0 0 1 3-3h5v32H8a3 3 0 0 1-3-3Z" fill="currentColor"/>
    <path d="m16 19 12-15h9L23 21Z" fill="currentColor"/>
    <path d="m16 21 7-2 14 17h-9Z" fill="currentColor"/>
    <path d="m28 4 5-3 6 6-5 6Z" fill="var(--orange)"/>
  </svg>;
}

export function Header({path, showWriting}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  useEffect(() => setOpen(false), [path]);
  const current = test => test ? 'page' : undefined;
  const home = <a href="/" aria-current={current(path==='/')}><Icon name="home"/> Home</a>;
  const writing = showWriting && <a href="/writing/" aria-current={current(isWritingPath(path))}><Icon name="pen"/> Writing</a>;
  const contact = <a href="/contact.html" aria-current={current(path==='/contact.html')}><Icon name="mail"/> Contact</a>;
  const resume = <a href="/resume.html" aria-current={current(path==='/resume.html')}><Icon name="file"/> Résumé</a>;
  return <header className="header" onClick={e=>{if(e.target.closest('a'))setOpen(false)}}>
    <a className="brand" href="/" aria-label="Kaustubh home"><Mark/><span>Kaustubh</span></a>
    <nav className="desktop-nav" aria-label="Main navigation">{home}{writing}{contact}{resume}</nav>
    <a className="header-contact" href={email}><Icon name="mail"/> Email <Arrow/></a>
    <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? 'Close −' : 'Menu +'}</button>
    <AnimatePresence>{open && <motion.nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      {home}{writing}{resume}{contact}
    </motion.nav>}</AnimatePresence>
  </header>;
}

export function SocialLinks({rows=false}) {
  return <div className={rows?'contact-directory':'social-links'}>{profile.socials.map(s=><a key={s.icon} href={s.url} target={s.icon==='mail'?undefined:'_blank'} rel={s.icon==='mail'?undefined:'noopener noreferrer'}><Icon name={s.icon}/><span>{s.label}{rows&&<small>{s.display}</small>}</span>{rows&&<Arrow/>}</a>)}</div>;
}

export function Footer({path}) {
  // Contact has its own page; posts end with their own reply options instead of the contact band.
  const band = !path.includes('contact') && !isPostPath(path);
  return <>{band&&<section className="contact-section" id="contact"><h2><Icon name="mail"/> Good to meet you.</h2><p className="contact-invite">If you’re working on something related, or want to compare notes, write to me.</p><a className="text-link" href="/contact.html">Contact <Arrow/></a></section>}<footer className="footer"><span>© {new Date().getFullYear()} Kaustubh</span><SocialLinks/><a className="back-top" href="#top" aria-label="Back to top"><Icon name="up"/></a></footer></>;
}
