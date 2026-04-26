import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import GlassCard from '../shared/GlassCard';
import MilestoneList from './MilestoneList';
import ResourceChips from './ResourceChips';

export default function PhaseCard({ phase, phaseIndex, progressMilestones, onToggleMilestone }) {
  const [open, setOpen] = useState(phaseIndex === 0);

  return (
    <div className="phase-card relative z-10 grid grid-cols-[40px_minmax(0,1fr)] gap-4 opacity-0">
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan bg-background font-heading text-sm font-bold text-cyan shadow-glow">
        {phaseIndex + 1}
      </div>

      <GlassCard className="phase-card-surface min-w-0 p-0" aos={false}>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-4 p-5 text-left"
        >
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-bold leading-7 text-textPrimary">
              {phase.title}
            </h3>
            <p className="mt-1 text-sm text-textMuted">
              {(phase.milestones || []).length} milestones
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[rgba(124,58,237,0.16)] px-3 py-1 text-xs font-bold text-violet">
            {phase.duration}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-6 border-t border-[rgba(0,212,255,0.12)] p-5 pt-5">
                <MilestoneList
                  milestones={progressMilestones}
                  onToggle={(milestoneIndex) =>
                    onToggleMilestone(phaseIndex, milestoneIndex)
                  }
                />
                <ResourceChips
                  resources={phase.resources}
                  youtubeSearchQueries={phase.youtubeSearchQueries}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
