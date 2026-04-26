import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ActivityGrid from '../components/progress/ActivityGrid';
import RoadmapHistoryCard from '../components/progress/RoadmapHistoryCard';
import StatsRow from '../components/progress/StatsRow';
import GlassCard from '../components/shared/GlassCard';
import LoadingScreen from '../components/shared/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';

const chartTooltip = {
  contentStyle: {
    background: '#0A0D14',
    border: '1px solid rgba(0,212,255,0.2)',
    borderRadius: 12,
    color: '#F0F4FF',
  },
  labelStyle: { color: '#00D4FF' },
};

const pieColors = ['#00D4FF', '#7C3AED', 'rgba(0,212,255,0.6)', 'rgba(124,58,237,0.55)'];

export default function ProgressPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const progress = useProgress();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 lg:pb-16">
      <LoadingScreen show={progress.loading} />

      <header className="mb-8" data-aos="fade-up">
        <h1 className="font-heading text-4xl font-bold text-textPrimary">
          Your Learning Journey
        </h1>
        <p className="mt-2 text-lg text-textMuted">
          <span className="text-cyan">{userProfile?.name || 'PathForge Learner'}</span>
        </p>
      </header>

      {progress.error ? (
        <p className="mb-6 rounded-input border border-danger/40 bg-[rgba(255,68,68,0.08)] px-3 py-2 text-sm text-danger">
          {progress.error}
        </p>
      ) : null}

      <StatsRow stats={progress} />

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <GlassCard data-aos-delay="0">
          <h2 className="mb-4 font-heading text-xl font-bold text-textPrimary">
            Progress Over Time
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress.lineData}>
                <CartesianGrid stroke="rgba(107,122,158,0.18)" />
                <XAxis dataKey="date" stroke="#6B7A9E" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B7A9E" allowDecimals={false} />
                <Tooltip {...chartTooltip} />
                <Line
                  type="monotone"
                  dataKey="milestones"
                  stroke="#00D4FF"
                  strokeWidth={3}
                  dot={{ r: 2, fill: '#00D4FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard data-aos-delay="80">
          <h2 className="mb-4 font-heading text-xl font-bold text-textPrimary">
            Skill Coverage
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={progress.radarData}>
                <PolarGrid stroke="rgba(107,122,158,0.24)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#6B7A9E', fontSize: 11 }} />
                <Radar
                  dataKey="value"
                  stroke="#7C3AED"
                  fill="#00D4FF"
                  fillOpacity={0.28}
                />
                <Tooltip {...chartTooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard data-aos-delay="160">
          <h2 className="mb-4 font-heading text-xl font-bold text-textPrimary">
            Phase Completion by Roadmap
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progress.barData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D4FF" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(107,122,158,0.18)" />
                <XAxis dataKey="name" stroke="#6B7A9E" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B7A9E" domain={[0, 100]} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="completion" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard data-aos-delay="240">
          <h2 className="mb-4 font-heading text-xl font-bold text-textPrimary">
            Time Invested by Topic
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progress.pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={104}
                  paddingAngle={4}
                >
                  {progress.pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#F0F4FF"
                  className="font-heading"
                  fontSize="26"
                  fontWeight="700"
                >
                  {progress.totalSessions}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#6B7A9E"
                  fontSize="12"
                >
                  sessions
                </text>
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>

      <div className="mt-8">
        <ActivityGrid data={progress.activityData} />
      </div>

      <section className="mt-8" data-aos="fade-up">
        <h2 className="mb-4 font-heading text-2xl font-bold text-textPrimary">
          Recent Roadmaps
        </h2>
        <div className="space-y-4">
          {progress.roadmaps.length ? (
            progress.roadmaps.map((roadmap, index) => (
              <RoadmapHistoryCard
                key={roadmap.id}
                roadmap={roadmap}
                progressDocs={progress.progressDocs}
                delay={index * 60}
                onClick={() => navigate('/roadmap', { state: { roadmapId: roadmap.id } })}
              />
            ))
          ) : (
            <GlassCard>
              <p className="text-textMuted">
                Saved roadmaps will appear here after you generate and save one.
              </p>
            </GlassCard>
          )}
        </div>
      </section>
    </div>
  );
}
