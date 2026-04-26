import { formatDate } from '../../utils/parseResponse';

function roadmapCompletion(roadmap, progressDocs) {
  const docs = progressDocs.filter((progress) => progress.roadmapId === roadmap.id);
  const completed = docs.filter((progress) => {
    const milestones = progress.milestones || [];
    return milestones.length > 0 && milestones.every((milestone) => milestone.checked);
  }).length;
  const total = roadmap.phases?.length || docs.length || 1;

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

export default function RoadmapHistoryCard({ roadmap, progressDocs = [], onClick, delay = 0 }) {
  const completion = roadmapCompletion(roadmap, progressDocs);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.05)] p-5 text-left backdrop-blur-[12px] transition hover:border-cyan hover:shadow-glow"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-textPrimary">
            {roadmap.userInput?.goal || 'Career Roadmap'}
          </h3>
          <p className="mt-1 text-sm text-textMuted">{formatDate(roadmap.createdAt)}</p>
        </div>
        <span className="rounded-full bg-[rgba(124,58,237,0.14)] px-3 py-1 text-xs font-bold text-violet">
          {roadmap.userInput?.stream || 'Stream'}
        </span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-[#1a1f2e]">
        <div
          className="h-full rounded-full bg-cyan"
          style={{ width: `${completion.percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-bold text-textMuted">
        {completion.completed} of {completion.total} phases completed
      </p>
    </button>
  );
}
