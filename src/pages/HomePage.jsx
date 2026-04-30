import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import GlassCard from '../components/shared/GlassCard';
import LoadingScreen from '../components/shared/LoadingScreen';
import NeonButton from '../components/shared/NeonButton';
import StreamSelect from '../components/form/StreamSelect';
import SkillsInput from '../components/form/SkillsInput';
import RoleSuggester from '../components/form/RoleSuggester';
import PillToggle from '../components/form/PillToggle';
import { DURATIONS, LEVELS } from '../constants/options';
import { useAuth } from '../hooks/useAuth';
import { useRoadmap } from '../hooks/useRoadmap';
import { db } from '../services/firebase';

const CareerOrbitScene = lazy(() => import('../components/shared/CareerOrbitScene'));

export default function HomePage() {
  const navigate = useNavigate();
  const { user, userProfile, refreshProfile } = useAuth();
  const { generateRoadmap, loading } = useRoadmap();
  const hydratedRef = useRef(false);
  const [stream, setStream] = useState('');
  const [skills, setSkills] = useState([]);
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('1 Month');
  const [level, setLevel] = useState('Beginner');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userProfile || hydratedRef.current) return;
    setStream(userProfile.stream || '');
    setSkills(userProfile.skills || []);
    setLevel(userProfile.level || 'Beginner');
    hydratedRef.current = true;
  }, [userProfile]);

  const canGenerate = useMemo(
    () => Boolean(stream && skills.length && goal.trim() && duration && level),
    [duration, goal, level, skills.length, stream]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canGenerate || !user) return;

    const input = {
      stream,
      skills,
      goal: goal.trim(),
      duration,
      level,
    };

    setError('');

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          stream,
          level,
          skills,
        },
        { merge: true }
      );
      await refreshProfile();
      const roadmapData = await generateRoadmap(input);
      navigate('/roadmap', { state: { roadmapData, userInput: input } });
    } catch (generateError) {
      setError(generateError.message || 'Could not generate your roadmap.');
    }
  }

  return (
    <div className="relative overflow-hidden px-4 pb-24 pt-6 sm:px-6 lg:pb-16">
      <Suspense fallback={null}>
        <CareerOrbitScene />
      </Suspense>
      <LoadingScreen show={loading} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <section className="grid min-h-[calc(100vh-5rem)] items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_600px] lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-2xl text-center lg:text-left"
          >
            <div className="mb-5 inline-flex rounded-full border border-[rgba(0,212,255,0.22)] bg-[rgba(10,13,20,0.72)] px-4 py-2 text-sm font-bold text-cyan shadow-glow backdrop-blur-md">
              Powered by Groq AI
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight text-textPrimary sm:text-5xl lg:text-6xl">
              Build a career path that feels alive.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-cyan/80 sm:text-lg">
              Turn your stream, skills, and goals into an animated roadmap with roles,
              milestones, resources, and progress tracking.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-left">
              {[
                ['24+', 'Role Ideas'],
                ['AI', 'Roadmaps'],
                ['Live', 'Progress'],
              ].map(([valueLabel, detail]) => (
                <div
                  key={detail}
                  className="rounded-input border border-[rgba(0,212,255,0.15)] bg-[rgba(10,13,20,0.62)] px-4 py-3 backdrop-blur-md"
                >
                  <p className="font-heading text-xl font-bold text-textPrimary">
                    {valueLabel}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-textMuted">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
          >
            <GlassCard
              className="mx-auto max-w-[600px] bg-[rgba(10,13,20,0.74)] shadow-glowStrong"
              aos={false}
            >
              <form onSubmit={handleSubmit} className="space-y-7">
                <StreamSelect value={stream} onChange={setStream} />
                <SkillsInput value={skills} onChange={setSkills} />
                <RoleSuggester
                  stream={stream}
                  skills={skills}
                  value={goal}
                  onChange={setGoal}
                />
                <PillToggle
                  label="Time Available"
                  name="duration"
                  options={DURATIONS}
                  value={duration}
                  onChange={setDuration}
                  delay={160}
                />
                <PillToggle
                  label="Your Current Level"
                  name="level"
                  options={LEVELS}
                  value={level}
                  onChange={setLevel}
                  delay={220}
                />

                {error ? (
                  <p className="rounded-input border border-danger/40 bg-[rgba(255,68,68,0.08)] px-3 py-2 text-sm text-danger">
                    {error}
                  </p>
                ) : null}

                <NeonButton
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={!canGenerate}
                  className="h-14 text-base"
                >
                  Generate My Roadmap
                </NeonButton>
              </form>
            </GlassCard>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
