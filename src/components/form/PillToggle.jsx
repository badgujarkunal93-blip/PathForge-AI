export default function PillToggle({ label, options, value, onChange, delay = 0, name }) {
  const groupId = `${name || label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-label`;

  return (
    <div data-aos="fade-up" data-aos-delay={delay}>
      <div
        id={groupId}
        className="mb-3 block font-heading text-sm font-bold text-textPrimary"
      >
        {label}
      </div>
      <div
        role="radiogroup"
        aria-labelledby={groupId}
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              name={name}
              onClick={() => onChange(option)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                active
                  ? 'border-cyan bg-cyan text-[#0A0D14] shadow-glow'
                  : 'border-[rgba(107,122,158,0.35)] text-textMuted hover:border-cyan hover:text-cyan'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
