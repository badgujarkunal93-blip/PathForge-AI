import { useState } from 'react';
import { COMMON_SKILLS } from '../../constants/options';

export default function SkillsInput({ value = [], onChange, id = 'skills', name = 'skills' }) {
  const [draft, setDraft] = useState('');
  const [noSkills, setNoSkills] = useState(value.length === 1 && value[0] === 'Beginner');

  function addSkill(skill) {
    const clean = skill.trim();
    if (!clean) return;
    if (!value.some((item) => item.toLowerCase() === clean.toLowerCase())) {
      onChange([...value, clean]);
    }
    setDraft('');
  }

  function removeSkill(skill) {
    const next = value.filter((item) => item !== skill);
    onChange(next);
    if (skill === 'Beginner') setNoSkills(false);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill(draft.replace(',', ''));
    }
  }

  function handleNoSkills() {
    setNoSkills(true);
    onChange(['Beginner']);
    setDraft('');
  }

  return (
    <div data-aos="fade-up" data-aos-delay="80">
      <label
        htmlFor={id}
        className="mb-2 block font-heading text-sm font-bold text-textPrimary"
      >
        Your Current Skills
      </label>
      <div className="min-h-12 rounded-input border border-[rgba(0,212,255,0.2)] bg-[rgba(255,255,255,0.04)] px-3 py-2 transition focus-within:border-cyan focus-within:shadow-glow">
        <div className="flex flex-wrap items-center gap-2">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-2 rounded-full bg-[rgba(0,212,255,0.12)] px-3 py-1 text-sm font-bold text-cyan"
            >
              {skill}
              <button
                type="button"
                className="text-textPrimary/70 hover:text-textPrimary"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id={id}
            name={name}
            disabled={noSkills}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={noSkills ? 'Beginner selected' : 'Type a skill, press Enter'}
            className="h-8 min-w-40 flex-1 bg-transparent text-sm text-textPrimary outline-none placeholder:text-textMuted disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {COMMON_SKILLS.map((skill) => (
          <button
            type="button"
            key={skill}
            disabled={noSkills}
            onClick={() => addSkill(skill)}
            className="rounded-full border border-[rgba(0,212,255,0.18)] px-3 py-1 text-xs font-bold text-textMuted transition hover:border-cyan hover:text-cyan disabled:cursor-not-allowed disabled:opacity-40"
          >
            {skill}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNoSkills}
        className="mt-3 rounded-full border border-violet px-4 py-2 text-sm font-bold text-violet transition hover:bg-[rgba(124,58,237,0.12)]"
      >
        I have no skills yet
      </button>
    </div>
  );
}
