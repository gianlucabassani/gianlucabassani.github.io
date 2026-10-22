import { useEffect, useRef } from 'react';

/** Keep scroll work out of React and suspend decorative loops outside the viewport. */
export default function HomeEffects() {
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const fraction = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${fraction})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    schedule();

    const sections = document.querySelectorAll<HTMLElement>('.home-main > section');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) (entry.target as HTMLElement).dataset.motionActive = String(entry.isIntersecting);
    }, { rootMargin: '120px' });
    sections.forEach(section => observer.observe(section));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resize.disconnect();
      observer.disconnect();
      sections.forEach(section => { delete section.dataset.motionActive; });
    };
  }, []);
  return <div ref={progress} className="home-scroll-progress" aria-hidden="true" />;
}
