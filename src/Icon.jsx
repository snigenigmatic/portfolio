import React from 'react';
const shapes = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
  arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
  down: <><path d="M12 4v16m-6-6 6 6 6-6"/></>,
  up: <><path d="M12 20V4m-6 6 6-6 6 6"/></>,
  home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
  file: <><path d="M14 3H5v18h14V8Z"/><path d="M14 3v5h5M8 12h8m-8 4h6"/></>,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
  work: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c5 3 13 3 18 0m-9-1v5"/></>,
  school: <><path d="m2 9 10-6 10 6-10 6Zm4 3v6c4 3 8 3 12 0v-6m4-3v8"/></>,
  code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-5 3 2-18"/></>,
  research: <><path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 15h10"/></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 10h4v4h-4Zm-1-8v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/></>,
  nodes: <><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m11 8-5 8m7-8 5 8M8 19h8"/></>,
  github: <path fill="currentColor" stroke="none" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.08c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.94.1-.72.4-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.61 0c2.13-1.44 3.08-1.15 3.08-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3c0-4 6-4 6 0v4" strokeWidth="2"/></>,
  twitter: <path stroke="none" fill="currentColor" d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.9-9L1.5 2H8l4.4 6.7L18.9 2Zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20Z"/>
};
export default function Icon({name, className=''}) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shapes[name] || shapes.code}</svg>;
}
