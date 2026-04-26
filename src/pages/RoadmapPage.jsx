import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import GlassCard from '../components/shared/GlassCard';
import LoadingScreen from '../components/shared/LoadingScreen';
import NeonButton from '../components/shared/NeonButton';
import PhaseCard from '../components/roadmap/PhaseCard';
import TimelineLine from '../components/roadmap/TimelineLine';
import { useAuth } from '../hooks/useAuth';
import { progressDocId, useRoadmap } from '../hooks/useRoadmap';
import { db } from '../services/firebase';

function buildProgress(phases = [], progressDocs = []) {
  return phases.map((phase, phaseIndex) => {
    const savedProgress = progressDocs.find((item) => item.phaseIndex === phaseIndex);
    if (savedProgress?.milestones?.length) {
      return savedProgress.milestones.map((milestone) => ({
        text: milestone.text,
        checked: Boolean(milestone.checked),
        checkedAt: milestone.checkedAt || null,
      }));
    }

    return (phase.milestones || []).map((text) => ({
      text,
      checked: false,
      checkedAt: null,
    }));
  });
}

export default function RoadmapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveRoadmap, loadRoadmap, loading } = useRoadmap();
  const containerRef = useRef(null);
  const savePromiseRef = useRef(null);
  const stateRoadmapId = location.state?.roadmapId || null;
  const stateRoadmapData = location.state?.roadmapData || null;
  const stateUserInput = location.state?.userInput || null;

  const [roadmap, setRoadmap] = useState(stateRoadmapData);
  const [input, setInput] = useState(stateUserInput);
  const [roadmapId, setRoadmapId] = useState(stateRoadmapId);
  const [progress, setProgress] = useState(() =>
    buildProgress(stateRoadmapData?.phases || [])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function hydrateRoadmap() {
      if (stateRoadmapId) {
        setError('');
        try {
          const result = await loadRoadmap(stateRoadmapId);
          if (cancelled) return;
          setRoadmap({ phases: result.roadmap.phases || [] });
          setInput(result.roadmap.userInput || null);
          setRoadmapId(result.roadmap.id);
          setProgress(buildProgress(result.roadmap.phases || [], result.progressDocs));
        } catch (loadError) {
          if (!cancelled) setError(loadError.message || 'Could not load roadmap.');
        }
      } else if (stateRoadmapData) {
        setRoadmap(stateRoadmapData);
        setInput(stateUserInput);
        setProgress(buildProgress(stateRoadmapData.phases || []));
      }
    }

    hydrateRoadmap();

    return () => {
      cancelled = true;
    };
  }, [loadRoadmap, stateRoadmapData, stateRoadmapId, stateUserInput]);

  useEffect(() => {
    if (!roadmap?.phases?.length || !containerRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = gsap.context(() => {
      if (reduced) {
        gsap.set('.phase-card', { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        '.phase-card',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.15,
        }
      );
    }, containerRef);

    return () => context.revert();
  }, [roadmap]);

  async function persistRoadmap() {
    if (roadmapId) return roadmapId;
    if (savePromiseRef.current) return savePromiseRef.current;

    setSaving(true);
    setError('');
    setSuccess('');

    savePromiseRef.current = saveRoadmap(input, roadmap?.phases || [])
      .then((newId) => {
        setRoadmapId(newId);
        setSuccess('Roadmap saved.');
        return newId;
      })
      .catch((saveError) => {
        setError(saveError.message || 'Could not save roadmap.');
        throw saveError;
      })
      .finally(() => {
        setSaving(false);
        savePromiseRef.current = null;
      });

    return savePromiseRef.current;
  }

  async function handleSave() {
    try {
      if (roadmapId) {
        setSuccess('Roadmap already saved.');
        return;
      }
      await persistRoadmap();
    } catch {
      // persistRoadmap already surfaces the user-facing error.
    }
  }

  async function handleToggleMilestone(phaseIndex, milestoneIndex) {
    if (!user) return;

    try {
      const savedId = await persistRoadmap();
      const nextProgress = progress.map((phaseMilestones, currentPhase) => {
        if (currentPhase !== phaseIndex) return phaseMilestones;
        return phaseMilestones.map((milestone, currentMilestone) => {
          if (currentMilestone !== milestoneIndex) return milestone;
          const checked = !milestone.checked;
          return {
            ...milestone,
            checked,
            checkedAt: checked ? new Date().toISOString() : null,
          };
        });
      });

      setProgress(nextProgress);
      await setDoc(
        doc(db, 'progress', progressDocId(user.uid, savedId, phaseIndex)),
        {
          uid: user.uid,
          roadmapId: savedId,
          phaseIndex,
          milestones: nextProgress[phaseIndex],
        },
        { merge: true }
      );
      setSuccess('Progress saved.');
    } catch (toggleError) {
      setError(toggleError.message || 'Could not save milestone progress.');
    }
  }

  if (!roadmap?.phases?.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <LoadingScreen show={loading} />
        <GlassCard>
          <h1 className="font-heading text-2xl font-bold text-textPrimary">
            No roadmap loaded
          </h1>
          <p className="mt-3 text-textMuted">
            Generate a roadmap from the home page or open one from your progress history.
          </p>
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          <NeonButton className="mt-6" onClick={() => navigate('/home')}>
            Go Home
          </NeonButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16">
      <LoadingScreen show={loading} />

      <div className="mb-8 grid items-center gap-4 rounded-card border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.04)] p-3 backdrop-blur-[12px] md:grid-cols-[160px_1fr_160px]">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="justify-self-start rounded-full border border-[rgba(0,212,255,0.2)] px-4 py-2 font-bold text-cyan transition hover:border-cyan hover:shadow-glow"
        >
          ← Back
        </button>
        <div className="text-center">
          <span className="font-heading text-lg font-bold text-cyan">
            {input?.goal || 'Career Roadmap'}
          </span>
          <span className="ml-3 rounded-full bg-[rgba(124,58,237,0.16)] px-3 py-1 text-xs font-bold text-violet">
            {input?.duration || 'Flexible'}
          </span>
        </div>
        <NeonButton
          variant="outlined"
          loading={saving}
          onClick={handleSave}
          className="justify-self-start md:justify-self-end"
        >
          💾 {roadmapId ? 'Saved' : 'Save'}
        </NeonButton>
      </div>

      {error ? (
        <p className="mx-auto mb-5 max-w-[720px] rounded-input border border-danger/40 bg-[rgba(255,68,68,0.08)] px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mx-auto mb-5 max-w-[720px] rounded-input border border-cyan/40 bg-[rgba(0,212,255,0.08)] px-3 py-2 text-sm text-cyan">
          {success}
        </p>
      ) : null}

      <div ref={containerRef} className="relative mx-auto max-w-[720px] space-y-6 pl-1">
        <TimelineLine />
        {roadmap.phases.map((phase, phaseIndex) => (
          <PhaseCard
            key={`${phase.title}-${phaseIndex}`}
            phase={phase}
            phaseIndex={phaseIndex}
            progressMilestones={progress[phaseIndex] || []}
            onToggleMilestone={handleToggleMilestone}
          />
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-[720px] gap-3 sm:grid-cols-2">
        <NeonButton variant="outlined" onClick={() => navigate('/home')}>
          🔄 Generate New
        </NeonButton>
        <NeonButton onClick={() => navigate('/progress')}>
          📊 View Progress
        </NeonButton>
      </div>
    </div>
  );
}
