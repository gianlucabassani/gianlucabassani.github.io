import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const DecodeProgress = createContext(1);
const cipher = '01ABCDEF#$%/<>{}';

export function DecodeText({ children }: { children: string | number }) {
  const progress = useContext(DecodeProgress);
  const text = String(children);
  if (progress >= 1) return <>{children}</>;
  const tick = Math.floor((progress + 1) * 32);
  const resolved = Math.floor(Math.max(0, progress) * text.length);
  let character = 0;
  return <span className="decode-text" data-decoding="true">
    <span className="decode-text-original sr-only">{text}</span>
    <span className="decode-text-cipher" aria-hidden="true">{text.split(/(\s+)/).map((word, wordIndex) => {
      if (/^\s+$/.test(word)) { character += word.length; return word; }
      const scrambled = [...word].map(letter => {
        const index = character++;
        return index < resolved ? letter : cipher[(index * 7 + tick * 3 + text.length) % cipher.length];
      }).join('');
      return <span className="decode-word" key={wordIndex}>
        <span className="decode-word-measure">{word}</span>
        <svg className="decode-word-current" viewBox="0 0 100 24" preserveAspectRatio="none" fill="currentColor">
          <text x="0" y="17" fontSize="16" textLength="100" lengthAdjust="spacingAndGlyphs">{scrambled}</text>
        </svg>
      </span>;
    })}</span>
  </span>;
}

export default function ScrollDecrypt({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const finishDecode = useRef(() => {});
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    const target = root.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!target || preference.matches || !('IntersectionObserver' in window)) return;
    let frame = 0;
    let finished = false;
    const finish = () => { finished = true; cancelAnimationFrame(frame); setProgress(1); };
    finishDecode.current = finish;
    setProgress(-0.5);
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (finished) return;
      const start = performance.now();
      let previous = -Infinity;
      const tick = (now: number) => {
        const elapsed = now - start;
        if (elapsed >= 3000 || document.hidden) { finish(); return; }
        if (now - previous >= 45) {
          setProgress((elapsed - 1000) / 2000);
          previous = now;
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.2 });
    observer.observe(target);
    const changed = () => { if (preference.matches) { observer.disconnect(); finish(); } };
    preference.addEventListener('change', changed);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); preference.removeEventListener('change', changed); finishDecode.current = () => {}; };
  }, []);
  return <DecodeProgress.Provider value={progress}>
    <div ref={root} className="scroll-decrypt" data-decoding={progress < 1} onFocusCapture={() => finishDecode.current()}>{children}</div>
  </DecodeProgress.Provider>;
}
