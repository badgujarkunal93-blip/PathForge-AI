import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { LEVELS } from '../../constants/options';
import GlassCard from '../shared/GlassCard';
import NeonButton from '../shared/NeonButton';

export default function UserCard({ user, profile, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [level, setLevel] = useState(profile?.level || 'Beginner');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(profile?.name || '');
    setLevel(profile?.level || 'Beginner');
  }, [profile?.level, profile?.name]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim() || profile?.name || 'PathForge Learner',
        level,
      });
      await onUpdated?.();
      setEditing(false);
    } catch (profileError) {
      setError(profileError.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  }

  const initial = (profile?.name || user?.email || 'P').slice(0, 1).toUpperCase();

  return (
    <GlassCard className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cyan font-heading text-3xl font-bold text-textPrimary shadow-glow">
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div>
              <label htmlFor="profile-name" className="sr-only">
                Profile name
              </label>
              <input
                id="profile-name"
                name="profileName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="h-12 w-full rounded-input border border-[rgba(0,212,255,0.2)] bg-[rgba(255,255,255,0.04)] px-4 text-textPrimary outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label htmlFor="profile-level" className="sr-only">
                Profile level
              </label>
              <select
                id="profile-level"
                name="profileLevel"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-12 w-full rounded-input border border-[rgba(0,212,255,0.2)] bg-[#0A0D14] px-4 text-textPrimary outline-none focus:border-cyan"
              >
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <>
            <h1 className="truncate font-heading text-2xl font-bold text-textPrimary">
              {profile?.name || 'PathForge Learner'}
            </h1>
            <p className="mt-1 truncate text-sm text-textMuted">{profile?.email || user?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(124,58,237,0.14)] px-3 py-1 text-xs font-bold text-violet">
                {profile?.stream || 'No stream set'}
              </span>
              <span className="rounded-full bg-[rgba(0,212,255,0.12)] px-3 py-1 text-xs font-bold text-cyan">
                {profile?.level || 'Beginner'}
              </span>
            </div>
          </>
        )}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </div>

      <div className="flex gap-3 self-stretch sm:self-auto">
        {editing ? (
          <>
            <NeonButton variant="outlined" onClick={() => setEditing(false)}>
              Cancel
            </NeonButton>
            <NeonButton loading={saving} onClick={saveProfile}>
              Save
            </NeonButton>
          </>
        ) : (
          <NeonButton variant="outlined" onClick={() => setEditing(true)}>
            Edit Profile
          </NeonButton>
        )}
      </div>
    </GlassCard>
  );
}
