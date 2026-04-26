import anime from 'animejs/lib/anime.es.js';
import { useEffect, useMemo, useRef } from 'react';
import { ACHIEVEMENTS } from '../../constants/options';

function hasSevenDayStreak(activityData = []) {
  let streak = 0;
  for (const item of activityData) {
    streak = item.count > 0 ? streak + 1 : 0;
    if (streak >= 7) return true;
  }
  return false;
}

export default function AchievementBadges({ stats }) {
  const wrapperRef = useRef(null);

  const unlocked = useMemo(
    () => ({
      firstRoadmap: stats.totalRoadmaps >= 1,
      fiveMilestones: stats.milestonesChecked >= 5,
      tenSkills: stats.skillsCount >= 10,
      fivePhases: stats.phasesCompleted >= 5,
      sevenDayStreak: hasSevenDayStreak(stats.activityData),
      sharedRoadmap: window.localStorage.getItem('pathforge-shared-roadmap') === 'true',
    }),
    [stats]
  );

  useEffect(() => {
    if (!wrapperRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    anime({
      targets: wrapperRef.current.querySelectorAll('.achievement-unlocked'),
      opacity: [0, 1],
      scale: [0.78, 1],
      translateY: [18, 0],
      delay: anime.stagger(70),
      easing: 'easeOutBounce',
    });

    return undefined;
  }, [unlocked]);

  return (
    <section data-aos="fade-up">
      <h2 className="mb-4 font-heading text-2xl font-bold text-textPrimary">Achievements</h2>
      <div ref={wrapperRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((achievement, index) => {
          const active = unlocked[achievement.key];
          return (
            <div
              key={achievement.key}
              data-aos="fade-up"
              data-aos-delay={index * 60}
              className={`relative min-h-[128px] overflow-hidden rounded-card border p-5 ${
                active
                  ? 'achievement-unlocked border-cyan bg-[rgba(0,212,255,0.1)] opacity-0 shadow-glow'
                  : 'border-[rgba(107,122,158,0.24)] bg-[rgba(255,255,255,0.03)] grayscale'
              }`}
            >
              <div className="text-3xl">{achievement.icon}</div>
              <h3 className="mt-3 font-heading text-base font-bold text-textPrimary">
                {achievement.label}
              </h3>
              {!active ? (
                <div className="absolute right-4 top-4 rounded-full border border-[rgba(107,122,158,0.35)] px-2 py-1 text-xs text-textMuted">
                  🔒
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
