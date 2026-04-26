import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import AchievementBadges from '../components/profile/AchievementBadges';
import SkillTags from '../components/profile/SkillTags';
import UserCard from '../components/profile/UserCard';
import RoadmapHistoryCard from '../components/progress/RoadmapHistoryCard';
import GlassCard from '../components/shared/GlassCard';
import LoadingScreen from '../components/shared/LoadingScreen';
import NeonButton from '../components/shared/NeonButton';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { auth, db } from '../services/firebase';
import { uniqueValues } from '../utils/parseResponse';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, userProfile, refreshProfile } = useAuth();
  const progress = useProgress();
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const skills = useMemo(
    () => uniqueValues([...(userProfile?.skills || []), ...progress.uniqueSkills]),
    [progress.uniqueSkills, userProfile?.skills]
  );

  async function addSkill(skill) {
    if (!user) return;
    setError('');

    try {
      const nextSkills = uniqueValues([...(userProfile?.skills || []), skill]);
      await updateDoc(doc(db, 'users', user.uid), { skills: nextSkills });
      await refreshProfile();
    } catch (skillError) {
      setError(skillError.message || 'Could not add skill.');
      throw skillError;
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setError('');

    try {
      await signOut(auth);
      navigate('/auth', { replace: true });
    } catch (logoutError) {
      setError(logoutError.message || 'Could not log out.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 lg:pb-16">
      <LoadingScreen show={progress.loading} />

      <UserCard user={user} profile={userProfile} onUpdated={refreshProfile} />

      {error ? (
        <p className="mt-6 rounded-input border border-danger/40 bg-[rgba(255,68,68,0.08)] px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-8 space-y-10">
        <SkillTags skills={skills} onAddSkill={addSkill} />
        <AchievementBadges stats={progress} />

        <section data-aos="fade-up">
          <h2 className="mb-4 font-heading text-2xl font-bold text-textPrimary">
            Roadmap History
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
                <p className="text-textMuted">Your saved roadmap history is empty.</p>
              </GlassCard>
            )}
          </div>
        </section>
      </div>

      <div className="mt-10">
        <NeonButton variant="danger" loading={loggingOut} onClick={handleLogout}>
          Logout
        </NeonButton>
      </div>
    </div>
  );
}
