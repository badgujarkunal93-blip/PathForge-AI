import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import GlassCard from '../shared/GlassCard';

const statItems = [
  { key: 'totalRoadmaps', label: 'Total Roadmaps' },
  { key: 'phasesCompleted', label: 'Phases Completed' },
  { key: 'milestonesChecked', label: 'Milestones Checked' },
  { key: 'skillsCount', label: 'Skills in Profile' },
];

export default function StatsRow({ stats }) {
  const numberRefs = useRef({});

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    statItems.forEach((item) => {
      const node = numberRefs.current[item.key];
      const value = Number(stats[item.key] || 0);
      if (!node) return;

      if (reduced) {
        node.textContent = value;
        return;
      }

      const counter = { value: 0 };
      gsap.to(counter, {
        value,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          node.textContent = Math.round(counter.value);
        },
      });
    });
  }, [stats]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((item, index) => (
        <GlassCard key={item.key} data-aos-delay={index * 80}>
          <p className="text-sm font-bold text-textMuted">{item.label}</p>
          <div
            ref={(node) => {
              numberRefs.current[item.key] = node;
            }}
            className="mt-3 font-heading text-4xl font-bold text-textPrimary"
          >
            0
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
