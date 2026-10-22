import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
const framePath = 'M20 1H1167L1199 25V69H440L422 87H1V20Z';
const borderFragments = [
  { position: 3, length: 2.8, duration: 8.3, delay: -2.1 },
  { position: 17, length: 1.4, duration: 11.7, delay: -7.6 },
  { position: 31, length: 3.6, duration: 9.1, delay: -4.8 },
  { position: 44, length: 1.8, duration: 13.3, delay: -9.2 },
  { position: 53, length: 2.4, duration: 7.7, delay: -1.3 },
  { position: 66, length: 3.2, duration: 10.9, delay: -6.4 },
  { position: 78, length: 1.2, duration: 12.7, delay: -3.5 },
  { position: 88, length: 2.1, duration: 9.7, delay: -8.1 },
];

function NavigationFrame({ mobile = false }: { mobile?: boolean }) {
  const path = mobile ? 'M10 1H389L399 11V73L391 81H1V10Z' : framePath;
  return (
    <svg className={`site-navigation-frame site-navigation-frame-${mobile ? 'mobile' : 'desktop'}`} viewBox={mobile ? '0 0 400 82' : '0 0 1200 88'} preserveAspectRatio="none" aria-hidden="true">
      <path className="site-navigation-surface" d={path} />
      {borderFragments.map((fragment, index) => <path key={fragment.position} className="site-navigation-trace" d={path} pathLength="100" style={{
        '--trace-color': ['185 90% 70%', '325 90% 74%', '270 90% 78%'][index % 3],
        '--trace-start': -fragment.position,
        '--trace-next': -((fragment.position + 37) % 100),
        '--trace-last': -((fragment.position + 71) % 100),
        strokeDasharray: `${fragment.length} ${100 - fragment.length}`,
        animationDuration: `${fragment.duration}s`,
        animationDelay: `${fragment.delay}s`,
      } as CSSProperties} />)}
    </svg>
  );
}

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
    <NavigationFrame />
    <NavigationFrame mobile />
    <div className="site-navigation-inner">
      <Link to="/" className="site-brand" aria-label="Gianluca Bassani home" onClick={() => setOpen(false)}>
        <span className="site-brand-copy"><span className="site-brand-name">Gianluca<span className="site-brand-break"><br /></span> Bassani</span><small><strong>0xPr1m3</strong><span className="site-brand-separator" aria-hidden="true">·</span><span className="site-brand-role">Cybersecurity</span></small></span>
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
