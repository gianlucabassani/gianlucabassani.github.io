import { useEffect, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Easter egg: a tiny vaporwave CRT that opens the shell. The home page hides three of them
 * (`spot` picks the placement); the one with `hotkey` also binds the backtick key.
 */
export default function ShellEgg({ spot, hotkey = false }: { spot: 'hero' | 'projects' | 'contact'; hotkey?: boolean }) {
  const navigate = useNavigate();
  const id = useId().replace(/:/g, '');
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (event.key === '`' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) navigate('/terminal');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, hotkey]);

  return <Link to="/terminal" className={`shell-egg shell-egg-${spot}`} aria-label="Open the hidden shell">
    <svg viewBox="0 0 160 124" aria-hidden="true">
      <defs>
        <linearGradient id={`egg-sky-${id}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1b0b33" /><stop offset="0.62" stopColor="#4a1560" /><stop offset="1" stopColor="#ff5fa2" /></linearGradient>
        <linearGradient id={`egg-sun-${id}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffe36e" /><stop offset="0.55" stopColor="#ff8a5c" /><stop offset="1" stopColor="#ff4f9a" /></linearGradient>
        <clipPath id={`egg-screen-${id}`}><rect x="14" y="12" width="132" height="84" rx="6" /></clipPath>
      </defs>
      <rect className="shell-egg-case" x="4" y="2" width="152" height="104" rx="10" />
      <g clipPath={`url(#egg-screen-${id})`}>
        <rect x="14" y="12" width="132" height="54" fill={`url(#egg-sky-${id})`} />
        <circle cx="80" cy="60" r="24" fill={`url(#egg-sun-${id})`} />
        {[50, 56, 61, 65].map((y, index) => <rect key={y} x="54" y={y} width="52" height={1.5 + index * 0.6} fill="#4a1560" />)}
        <rect x="14" y="66" width="132" height="30" fill="#120524" />
        <g className="shell-egg-grid" stroke="#5ff2ff" strokeWidth="0.7" fill="none">
          {[-90, -50, -22, 0, 22, 50, 90].map(offset => <path key={offset} d={`M80 66L${80 + offset * 2.4} 96`} />)}
          {[69, 73, 79, 87].map(y => <path key={y} className="shell-egg-row" d={`M14 ${y}H146`} />)}
        </g>
        <path d="M14 66H146" stroke="#ff7ad9" strokeWidth="1" />
        <g className="shell-egg-scan" fill="#000" opacity="0.18">{Array.from({ length: 21 }, (_, index) => <rect key={index} x="14" y={12 + index * 4} width="132" height="1.4" />)}</g>
        <text className="shell-egg-text" x="20" y="27">&gt;<tspan className="shell-egg-cursor">_</tspan></text>
        <text className="shell-egg-text shell-egg-secret" x="20" y="27">&gt; ./shell</text>
      </g>
      <rect className="shell-egg-bezel" x="14" y="12" width="132" height="84" rx="6" />
      <circle className="shell-egg-led" cx="138" cy="101" r="1.8" />
      <path className="shell-egg-case" d="M58 106H102L108 120H52Z" />
    </svg>
    <span className="shell-egg-caption" aria-hidden="true">press ` to jack in</span>
  </Link>;
}
