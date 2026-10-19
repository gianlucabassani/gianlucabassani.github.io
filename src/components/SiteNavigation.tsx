import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const destinations = [
  {path:'/about', label:'About Me'},
  {path:'/projects', label:'Projects'},
  {path:'/blog', label:'Blog'},
  {path:'/boxes', label:'Box Writeups'},
  {path:'/ctf', label:'CTF Solves'},
  {path:'/skills', label:'Skills'},
];

export default function SiteNavigation() {
  const {pathname} = useLocation();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const escape = (event:KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  return <header className="site-navigation">
    <svg className="site-navigation-frame" viewBox="0 0 1200 88" preserveAspectRatio="none" aria-hidden="true">
      <path className="site-navigation-surface" d="M20 1H1167L1199 25V69H440L422 87H1V20Z" />
      <path className="site-navigation-trace" d="M25 1H115L122 8H194M1106 69H1178L1199 48" />
    </svg>
    <div className="site-navigation-inner">
      <Link to="/" className="site-brand" aria-label="Gianluca Bassani home" onClick={() => setOpen(false)}>
        <span>Gianluca Bassani<small>Cybersecurity <span aria-hidden="true">·</span> <strong>0xPr1m3</strong></small></span>
      </Link>
      <button className="site-menu-toggle" type="button" ref={toggle} aria-controls="site-menu" aria-expanded={open}
        aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <nav id="site-menu" aria-label="Main navigation" className={open ? 'site-menu is-open' : 'site-menu'}>
        {destinations.map(({path, label}) => <Link key={path} to={path} onClick={() => setOpen(false)}
          aria-current={pathname === path || pathname.startsWith(`${path}/`) || (path === '/about' && pathname === '/') ? 'page' : undefined}>
          {label}
        </Link>)}
        <Link to="/terminal" className="site-console-link" onClick={() => setOpen(false)}>CLI <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </nav>
    </div>
  </header>;
}
