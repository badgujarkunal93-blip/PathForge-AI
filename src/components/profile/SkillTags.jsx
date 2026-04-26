import anime from 'animejs/lib/anime.es.js';
import { useEffect, useRef, useState } from 'react';

export default function SkillTags({ skills = [], onAddSkill }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const tagsRef = useRef(null);

  useEffect(() => {
    if (!tagsRef.current || !skills.length) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    anime({
      targets: tagsRef.current.querySelectorAll('.skill-tag'),
      opacity: [0, 1],
      scale: [0.7, 1],
      translateY: [12, 0],
      delay: anime.stagger(50),
      easing: 'spring(1, 80, 10, 0)',
    });

    return undefined;
  }, [skills]);

  async function submitSkill(event) {
    event.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    await onAddSkill(clean);
    setDraft('');
    setAdding(false);
  }

  return (
    <section data-aos="fade-up">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-textPrimary">Skills Gained</h2>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan text-xl font-bold text-cyan transition hover:bg-[rgba(0,212,255,0.08)] hover:shadow-glow"
          aria-label="Add skill"
        >
          +
        </button>
      </div>

      {adding ? (
        <form onSubmit={submitSkill} className="mb-4 flex gap-2">
          <label htmlFor="profile-skill" className="sr-only">
            Add a skill
          </label>
          <input
            id="profile-skill"
            name="skill"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
            placeholder="Add a skill"
            className="h-11 min-w-0 flex-1 rounded-input border border-[rgba(0,212,255,0.2)] bg-[rgba(255,255,255,0.04)] px-4 text-textPrimary outline-none focus:border-cyan"
          />
          <button
            type="submit"
            className="rounded-full border border-cyan px-4 py-2 text-sm font-bold text-cyan"
          >
            Add
          </button>
        </form>
      ) : null}

      <div ref={tagsRef} className="flex flex-wrap gap-3">
        {skills.length ? (
          skills.map((skill) => (
            <span
              key={skill}
              className="skill-tag rounded-full border border-[rgba(0,212,255,0.28)] bg-[rgba(0,212,255,0.12)] px-4 py-2 text-sm font-bold text-cyan opacity-0 shadow-glow"
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-sm text-textMuted">No skills collected yet.</p>
        )}
      </div>
    </section>
  );
}
