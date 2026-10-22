import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Project } from '@/data/projects';
import ProjectShowcase from '@/components/ProjectShowcase';
import { Button } from '@/components/ui/button';

export default function ProjectRail({projects}: {projects:Project[]}) {
  const items = useMemo(() => [...projects].sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))), [projects]);
  const copies = items.length > 1 ? Math.min(2, items.length) : 0;
  const sequence = useMemo(() => copies ? [...items.slice(-copies), ...items, ...items.slice(0, copies)] : items, [items, copies]);
  const rail = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const step = useRef(0);
  const [position, setPosition] = useState({first:0, last:0});

  useEffect(() => {
    const element = track.current;
    const wrapper = rail.current;
    if (!element || !wrapper || !items.length) return;
    let settle:ReturnType<typeof setTimeout>;
    let settledIndex = copies;
    const update = () => {
      const bounds = element.getBoundingClientRect();
      const visible = [...element.children].flatMap((child, index) => {
        const rect = child.getBoundingClientRect();
        return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 ? [((index - copies) % items.length + items.length) % items.length] : [];
      });
      if (!visible.length) return;
      const first = visible[0] ?? 0;
      const last = visible.at(-1) ?? first;
      setPosition(previous => previous.first === first && previous.last === last ? previous : {first, last});
    };
    const resize = () => {
      step.current = (element.firstElementChild?.getBoundingClientRect().width || 0) + parseFloat(getComputedStyle(element).columnGap || '0');
      element.scrollTo({left:settledIndex * step.current, behavior:'instant'});
      update();
    };
    const settleScroll = () => {
      if (copies && step.current) {
        const index = Math.round(element.scrollLeft / step.current);
        if (index < copies) element.scrollTo({left:element.scrollLeft + items.length * step.current, behavior:'instant'});
        else if (index >= copies + items.length) element.scrollTo({left:element.scrollLeft - items.length * step.current, behavior:'instant'});
      }
      if (step.current) settledIndex = Math.round(element.scrollLeft / step.current);
      update();
    };
    const onScroll = () => {
      update();
      clearTimeout(settle);
      settle = setTimeout(settleScroll, 180);
    };
    // Preview copies remain visual only until they enter the readable center.
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const hidden = entry.intersectionRatio < 0.5;
        entry.target.setAttribute('aria-hidden', String(hidden));
        entry.target.setAttribute('data-preview', String(hidden));
        if (hidden) entry.target.setAttribute('inert', '');
        else entry.target.removeAttribute('inert');
      });
    }, {root:element, threshold:[0, 0.5, 1]});
    [...element.children].forEach(child => visibility.observe(child));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    window.addEventListener('resize', resize);
    element.addEventListener('scroll', onScroll, {passive:true});
    return () => { element.removeEventListener('scroll', onScroll); window.removeEventListener('resize', resize); observer.disconnect(); visibility.disconnect(); clearTimeout(settle); };
  }, [items, copies]);

  const move = (direction:number) => {
    track.current?.scrollBy({left:direction * step.current, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  const keyboard = (event:KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      event.currentTarget.scrollTo({left:(copies + (event.key === 'Home' ? 0 : items.length - 1)) * step.current, behavior:'instant'});
    }
  };
  if (!items.length) return null;
  return <div className="project-rail" ref={rail}>
    <h2 className="project-rail-title home-section-title"><span className="site-section-title">Projects</span></h2>
    <p id="project-rail-help" className="sr-only">Browse all {items.length} projects using the side arrows, swipe, or focus the gallery and use the arrow keys.</p>
    <div className="project-channel">
      <div className="project-channel-particles" aria-hidden="true">
        {['left', 'right'].map(side => <div key={side} className={`project-channel-field project-channel-field-${side}`}>
          {Array.from({length:36}, (_, index) => <span key={index} style={{left:`${3 + ((index * 31) % 92)}%`, top:`${4 + ((index * 43) % 92)}%`, width:index % 6 === 0 ? 8 : index % 4 === 0 ? 3 : 2, height:index % 4 === 0 ? 3 : 2, animationDelay:`${index * -173}ms`, animationDuration:`${1700 + (index % 7) * 360}ms`, '--particle-y':`${((index % 5) - 2) * 4}px`} as CSSProperties} />)}
        </div>)}
      </div>
      <div ref={track} className="project-rail-track" role="list" aria-label="Project gallery" aria-describedby="project-rail-help" tabIndex={0} onKeyDown={keyboard}>
        {sequence.map((project, index) => {
          const preview = index < copies || index >= copies + items.length;
          return <div className="project-rail-item" role={preview ? 'presentation' : 'listitem'} aria-hidden={preview ? true : undefined} key={`${project.id}-${index}`}>
            <ProjectShowcase project={project} headingAs="h3" />
          </div>;
        })}
      </div>
    </div>
    {items.length > 1 && <div className="project-rail-controls">
        <button className="project-rail-edge project-rail-edge-left" type="button" aria-label="Previous projects" onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
        <div className="project-rail-position" aria-hidden="true">
          <div className="project-rail-steps">{items.map((item, index) => <span key={item.id} data-active={index === position.first || index === position.last} />)}</div>
          <span>{position.first + 1}{position.last !== position.first ? `${position.last > position.first ? '–' : ', '}${position.last + 1}` : ''}<span className="project-rail-total"> / {items.length}</span></span>
        </div>
        <button className="project-rail-edge project-rail-edge-right" type="button" aria-label="Next projects" onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
    </div>}
    <div className="project-rail-footer">
      <span className="sr-only" aria-live="polite" aria-atomic="true">Showing {items[position.first]?.title}{position.last !== position.first ? ` and ${items[position.last]?.title}` : ''}</span>
      <Button asChild size="lg" variant="secondary"><Link to="/projects">View all projects<ArrowUpRight className="action-arrow" size={18} aria-hidden="true" /></Link></Button>
    </div>
  </div>;
}
