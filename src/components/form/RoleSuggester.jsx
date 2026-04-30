import anime from 'animejs/lib/anime.es.js';
import { useEffect, useRef, useState } from 'react';
import { suggestRoles } from '../../services/groq';
import LoadingSpinner from '../shared/LoadingSpinner';

const demandClasses = {
  High: 'border-cyan bg-[rgba(0,212,255,0.12)] text-cyan',
  Medium: 'border-violet bg-[rgba(124,58,237,0.12)] text-violet',
  Low: 'border-[rgba(107,122,158,0.35)] bg-[rgba(255,255,255,0.04)] text-textMuted',
};

const categoryClasses = {
  General: 'border-[rgba(0,212,255,0.22)] text-cyan',
  Specialized: 'border-[rgba(124,58,237,0.35)] text-violet',
  Unique: 'border-[rgba(255,255,255,0.2)] text-textPrimary',
};

export default function RoleSuggester({
  stream,
  skills,
  value,
  onChange,
  id = 'target-role',
  name = 'targetRole',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(value || '');
  const [customRole, setCustomRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardsRef = useRef(null);

  useEffect(() => {
    if (!suggestions.length || !cardsRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    anime({
      targets: cardsRef.current.querySelectorAll('.role-card'),
      opacity: [0, 1],
      translateY: [28, 0],
      translateX: (_, index) => [index % 2 === 0 ? -28 : 28, 0],
      rotate: (_, index) => [index % 2 === 0 ? -3 : 3, 0],
      scale: [0.94, 1],
      delay: anime.stagger(35),
      easing: 'spring(1, 80, 10, 0)',
    });

    return undefined;
  }, [suggestions]);

  async function handleSuggest() {
    if (!stream || !skills.length) {
      setError('Add your stream and at least one skill before asking AI for roles.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const roles = await suggestRoles(stream, skills);
      setSuggestions(roles);
    } catch (roleError) {
      setError(roleError.message || 'Could not suggest roles right now.');
    } finally {
      setLoading(false);
    }
  }

  function chooseRole(role) {
    setSelectedRole(role);
    setCustomRole('');
    onChange(role);
  }

  function changeCustomRole(role) {
    setCustomRole(role);
    setSelectedRole('');
    onChange(role);
  }

  return (
    <div data-aos="fade-up" data-aos-delay="120">
      <label
        htmlFor={id}
        className="mb-2 block font-heading text-sm font-bold text-textPrimary"
      >
        Your Target Role
      </label>
      <div className="rounded-input border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.03)] p-4">
        <p className="mb-4 text-sm text-textMuted">
          Let AI suggest general, specialized, and unique roles for you
        </p>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-input border border-violet px-4 py-3 font-heading text-sm font-bold text-violet transition hover:bg-[rgba(124,58,237,0.1)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoadingSpinner /> : null}
          ✨ Suggest Roles with AI
        </button>

        {error ? (
          <p className="mt-3 rounded-input border border-danger/40 bg-[rgba(255,68,68,0.08)] px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {suggestions.length ? (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-textMuted">
              <span>{suggestions.length} role ideas</span>
              <span>Pick one or type your own</span>
            </div>
            <div
              ref={cardsRef}
              className="grid max-h-[520px] gap-3 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2"
              data-lenis-prevent
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
            >
              {suggestions.map((suggestion) => {
                const active = selectedRole === suggestion.role;
                const category = suggestion.category || 'General';
                return (
                  <button
                    type="button"
                    key={suggestion.role}
                    onClick={() => chooseRole(suggestion.role)}
                    className={`role-card min-h-[124px] rounded-card border bg-[rgba(255,255,255,0.04)] p-4 text-left transition hover:border-cyan ${
                      active
                        ? 'border-cyan shadow-glow'
                        : 'border-[rgba(0,212,255,0.15)]'
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="font-heading text-base font-bold leading-6 text-textPrimary">
                        {suggestion.role}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${
                          demandClasses[suggestion.demandLevel]
                        }`}
                      >
                        {suggestion.demandLevel}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-textMuted">
                      {suggestion.description}
                    </p>
                    <span
                      className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[11px] font-bold ${
                        categoryClasses[category] || categoryClasses.General
                      }`}
                    >
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <input
          id={id}
          name={name}
          value={customRole}
          onChange={(event) => changeCustomRole(event.target.value)}
          placeholder="Or type a custom role..."
          className="mt-4 h-12 w-full rounded-input border border-[rgba(0,212,255,0.2)] bg-[rgba(255,255,255,0.04)] px-4 text-textPrimary outline-none transition placeholder:text-textMuted focus:border-cyan focus:shadow-glow"
        />
      </div>
    </div>
  );
}
