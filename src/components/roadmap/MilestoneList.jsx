import gsap from 'gsap';
import { useRef } from 'react';

export default function MilestoneList({ milestones = [], onToggle }) {
  const checkboxRefs = useRef({});

  function animateCheck(index) {
    const node = checkboxRefs.current[index];
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.fromTo(
      node,
      { scale: 0.82 },
      { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.45)' }
    );
  }

  return (
    <div>
      <h4 className="mb-3 font-heading text-sm font-bold text-cyan">🎯 Milestones</h4>
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const item =
            typeof milestone === 'string'
              ? { text: milestone, checked: false }
              : milestone;
          return (
            <button
              type="button"
              key={`${item.text}-${index}`}
              onClick={() => {
                animateCheck(index);
                onToggle(index);
              }}
              className="flex w-full items-start gap-3 rounded-input border border-transparent p-2 text-left transition hover:border-[rgba(0,212,255,0.12)] hover:bg-[rgba(0,212,255,0.04)]"
            >
              <span
                ref={(node) => {
                  checkboxRefs.current[index] = node;
                }}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  item.checked
                    ? 'border-cyan bg-cyan text-[#0A0D14] shadow-glow'
                    : 'border-[rgba(0,212,255,0.38)] text-transparent'
                }`}
              >
                ✓
              </span>
              <span
                className={`text-sm leading-6 transition ${
                  item.checked ? 'text-textMuted line-through' : 'text-textPrimary'
                }`}
              >
                {item.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
