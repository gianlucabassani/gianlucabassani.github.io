import { useEffect, useState } from 'react';

const lines = ['BUILD, BREAK,', 'REPEAT.'];
const glyphs = '01/<>_+:';

export default function HeroHeading() {
  const [display, setDisplay] = useState(lines);
  const [decoding, setDecoding] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let cancelled = false;
    const finish = () => {
      cancelAnimationFrame(frame);
      setDisplay(lines);
      setDecoding(false);
    };
    const changed = () => { if (preference.matches) finish(); };
    preference.addEventListener('change', changed);
    void document.fonts.load('700 48px Oxanium').then(() => {
      if (cancelled || preference.matches) return;
      const start = performance.now();
      let last = -Infinity;
      setDecoding(true);
      const tick = (now: number) => {
        const elapsed = now - start;
        if (elapsed >= 1400 || document.hidden) { finish(); return; }
        if (now - last >= 40) {
          last = now;
          setDisplay(lines.map((line, row) => [...line].map((letter, index) => {
            if (letter === ' ' || elapsed >= 180 + row * 180 + index * 65) return letter;
            return glyphs[(index * 3 + row + Math.floor(elapsed / 65)) % glyphs.length];
          }).join('')));
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', changed);
    };
  }, []);

  return <h1 className="hero-signal-heading font-display font-bold mb-6 tracking-tight" data-decoding={decoding}>
    <span className="sr-only">{lines.join(' ')}</span>
    {lines.map((line, index) => <span className={`hero-signal-line ${index ? 'gradient-text-accent' : 'gradient-text-purple'}`} aria-hidden="true" key={line}>
      <span className="hero-signal-measure">{line}</span>
      <span className="hero-signal-output">{display[index]}</span>
    </span>)}
  </h1>;
}
