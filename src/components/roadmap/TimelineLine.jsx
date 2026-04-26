import anime from 'animejs/lib/anime.es.js';
import { useEffect, useRef } from 'react';

export default function TimelineLine() {
  const lineRef = useRef(null);

  useEffect(() => {
    if (!lineRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      lineRef.current.style.height = '100%';
      return undefined;
    }

    anime({
      targets: lineRef.current,
      height: ['0%', '100%'],
      duration: 1100,
      easing: 'easeOutCubic',
    });

    return undefined;
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-0 left-[19px] top-0 z-0 w-0.5 overflow-hidden rounded-full bg-[rgba(0,212,255,0.14)]">
      <div ref={lineRef} className="h-0 w-full rounded-full bg-cyan shadow-glow" />
    </div>
  );
}
