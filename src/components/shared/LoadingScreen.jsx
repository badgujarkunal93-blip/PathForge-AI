import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { LOADING_MESSAGES } from '../../constants/options';

export default function LoadingScreen({ show = true }) {
  const iconRef = useRef(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!show) return undefined;
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 1500);

    return () => window.clearInterval(interval);
  }, [show]);

  useEffect(() => {
    if (!show || !iconRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const context = gsap.context(() => {
      gsap.to(iconRef.current, {
        rotate: 360,
        duration: 3,
        repeat: -1,
        ease: 'none',
      });
      gsap.to(iconRef.current, {
        scale: 1.14,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => context.revert();
  }, [show]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col items-center text-center">
            <div
              ref={iconRef}
              className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(0,212,255,0.28)] bg-[rgba(255,255,255,0.05)] text-5xl shadow-glow"
              aria-hidden="true"
            >
              🧭
            </div>
            <p className="font-heading text-xl font-bold text-textPrimary">
              {LOADING_MESSAGES[messageIndex]}
            </p>
            <div className="mt-5 h-3 w-3 animate-pulse rounded-full bg-cyan shadow-glow" />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
