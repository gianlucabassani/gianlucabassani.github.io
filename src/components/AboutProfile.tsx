import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Shield, Code2, Workflow, Bot, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileLearning from '@/components/ProfileLearning';
import { skillGroups } from '@/data/skillGroups';

// Spread the strongest axes across the chart instead of arranging them by rank.
const axisOrder = ['offensive-security', 'infra-automation', 'ai-agents', 'coding', 'operating-systems'];
const areas = axisOrder.map(id => skillGroups.find(group => group.id === id)!);
const areaIcons = [Shield, Workflow, Bot, Code2, Terminal];

const center = 250;
const radius = 150;
function point(index: number, scale = 1) {
  const angle = (index * (360 / areas.length) - 90) * Math.PI / 180;
  return { x: center + Math.cos(angle) * radius * scale, y: center + Math.sin(angle) * radius * scale };
}
const polygon = (scale: number) => areas.map((_, index) => { const p = point(index, scale); return `${p.x},${p.y}`; }).join(' ');
const profile = areas.map((area, index) => { const p = point(index, area.value / 100); return `${p.x},${p.y}`; }).join(' ');

function ReadoutTitle({ text, id }: { text: string; id: string }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const finish = () => { cancelAnimationFrame(frame); setDisplay(text); };
    const changed = () => { if (preference.matches) finish(); };
    preference.addEventListener('change', changed);
    if (!preference.matches) {
      const start = performance.now();
      let last = -Infinity;
      const tick = (now: number) => {
        const elapsed = now - start;
        if (elapsed >= 620 || document.hidden) { finish(); return; }
        if (now - last >= 45) {
          last = now;
          setDisplay([...text].map((letter, index) => letter === ' ' || elapsed > 80 + index / text.length * 480 ? letter : '01/<>_'[(index + Math.floor(elapsed / 60)) % 6]).join(''));
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(frame); preference.removeEventListener('change', changed); };
  }, [text]);
  return <h4 id={id} className="profile-readout-title">
    <span className="sr-only">{text}</span>
    <span className="profile-readout-measure" aria-hidden="true">{text}</span>
    <span className="profile-readout-output" aria-hidden="true">{display}</span>
  </h4>;
}

export default function AboutProfile() {
  const instanceId = useId();
  const titleId = `${instanceId}-title`;
  const detailId = `${instanceId}-detail`;
  const fillId = `${instanceId}-fill`;
  const [selected, setSelected] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const radarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = radarRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const area = areas[selected];
  const AreaIcon = areaIcons[selected];
  const activePoint = point(selected, area.value / 100);

  return (
    <section className="about-profile" aria-labelledby={titleId}>
      <svg className="profile-frame" viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true"><path d="M1 72V25L25 1H310M890 1H1175L1199 25V300M1199 760V875L1175 899H930M310 899H25L1 875V600" /></svg>
      <header className="profile-intro">
        <div><h2 id={titleId}>Hello World!</h2><p>I’m Gianluca Bassani.</p></div>
        <dl className="profile-player-stats" aria-label="Player profile">
          <div><dt><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M5 0h2v3h2v2h3v2H9v2H7v3H5V9H3V7H0V5h3V3h2Z" /></svg>Lvl</dt><dd>22<span className="sr-only"> years old</span></dd></div>
          <div><dt><svg viewBox="0 0 12 12" aria-hidden="true"><path fillRule="evenodd" d="M3 0h6v1h2v2h1v5h-2v2H8v2H4v-2H2V8H0V3h1V1h2Zm1 3v4h4V3Z" /></svg>Map</dt><dd>Italy</dd></div>
        </dl>
      </header>
      <div className="profile-skills-heading"><h3>Technical skills</h3><Link className="profile-section-action" to="/skills">Explore all skills <ArrowUpRight size={19} aria-hidden="true" /></Link></div>
      <div className="profile-skill-layout">
        <div className="profile-radar" ref={radarRef} data-revealed={revealed}>
          <svg viewBox="0 0 500 500" role="group" aria-label="Explore five technical skill areas">
            <defs>
              <radialGradient id={fillId}><stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.04" /><stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.25" /></radialGradient>
            </defs>
            <g className="radar-instrument" aria-hidden="true">
              <polygon className="radar-calibration" points={polygon(1.19)} />
              <path d="M237 250H263M250 237V263" />
            </g>
            <g className="radar-grid" aria-hidden="true">{[0.2, 0.4, 0.6, 0.8, 1].map(scale => <polygon key={scale} points={polygon(scale)} pathLength="100" />)}{areas.map((item, index) => { const p = point(index); return <line key={item.title} x1={center} y1={center} x2={p.x} y2={p.y} />; })}</g>
            <polygon className="radar-profile-halo" points={profile} aria-hidden="true" />
            <polygon className="radar-profile-area" style={{ fill: `url(#${fillId})` }} points={profile} pathLength="100" aria-hidden="true" />
            <g className="radar-data-flow" aria-hidden="true">{areas.map((item, index) => {
              const p = point(index, item.value / 100);
              return <line key={item.id} x1={center} y1={center} x2={p.x} y2={p.y} pathLength="100" style={{ animationDelay: `${index * -0.85}s` }} />;
            })}</g>
            {areas.map((item, index) => {
              const p = point(index, item.value / 100);
              const label = point(index, 1.43);
              const end = point(index);
              return <g key={item.title} className="radar-axis" data-selected={selected === index} style={{ animationDelay: `${index * 120}ms` }}>
                <line className="radar-selected-axis" x1={center} y1={center} x2={end.x} y2={end.y} aria-hidden="true" />
                <circle className="radar-point" cx={p.x} cy={p.y} r={selected === index ? 6 : 4} aria-hidden="true" />
                <g className="radar-control" role="button" tabIndex={0} aria-pressed={selected === index} aria-label={`Explore ${item.title}`} onClick={() => setSelected(index)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(index); } }}>
                  <rect x={label.x - 72} y={label.y - 22} width={144} height={44} rx={3} />
                  <text x={label.x} y={label.y - (item.label.length > 1 ? 7 : 0)} dy="0.35em" textAnchor="middle">{item.label.map((line, i) => <tspan key={line} x={label.x} dy={i ? 17 : 0}>{line}</tspan>)}</text>
                </g>
              </g>;
            })}
            <g className="radar-active-tracker" style={{ transform: `translate(${activePoint.x}px, ${activePoint.y}px)` }} aria-hidden="true"><circle className="radar-active-ring" r="12" /></g>
            <circle className="radar-center" cx={center} cy={center} r={3} aria-hidden="true" />
          </svg>
        </div>
        <section className="profile-skill-detail" aria-labelledby={detailId}>
          <svg className="profile-readout-trace" viewBox="0 0 440 390" preserveAspectRatio="none" aria-hidden="true"><path d="M1 60V16L16 1H115M230 1H410L439 30V55M439 310V374L424 389H310M90 389H1" /></svg>
          <div className="profile-area-emblem" key={`icon-${selected}`} aria-hidden="true"><AreaIcon size={27} strokeWidth={1.3} /></div>
          <ReadoutTitle id={detailId} key={`title-${selected}`} text={area.title} />
          <p key={`description-${selected}`}>{area.description}</p>
          <ul key={selected}>{area.skills.map(skill => <li key={skill.id}><span className="profile-skill-marker" aria-hidden="true" />{skill.name}</li>)}</ul>
          <Link className="profile-area-link" to={`/skills#${area.id}`}>View skills in detail<ArrowUpRight size={17} aria-hidden="true" /></Link>
        </section>
      </div>
      <ProfileLearning />
    </section>
  );
}
