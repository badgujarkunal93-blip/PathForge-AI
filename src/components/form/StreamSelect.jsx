import { useEffect, useMemo, useRef, useState } from 'react';
import { STREAM_OPTIONS } from '../../constants/options';

export default function StreamSelect({
  value,
  onChange,
  label = 'Your Stream / Branch',
  placeholder = 'Search or select your stream',
  id = 'stream',
  name = 'stream',
}) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClick(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const search = query.toLowerCase();
    return STREAM_OPTIONS.filter((option) => option.toLowerCase().includes(search));
  }, [query]);

  function selectOption(option) {
    onChange(option);
    setQuery(option);
    setOpen(false);
  }

  return (
    <div
      className={open ? 'relative z-[150]' : 'relative'}
      ref={wrapperRef}
    >
      <label
        htmlFor={id}
        className="mb-2 block font-heading text-sm font-bold text-textPrimary"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange('');
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="h-12 w-full rounded-input border border-[rgba(0,212,255,0.2)] bg-[rgba(255,255,255,0.04)] px-4 text-textPrimary outline-none transition focus:border-cyan focus:shadow-glow"
      />
      {open ? (
        <div
          className="absolute z-[160] mt-2 max-h-64 w-full overflow-y-auto overscroll-contain rounded-input border border-[rgba(0,212,255,0.18)] bg-[#0A0D14] p-2 shadow-2xl"
          data-lenis-prevent
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => selectOption(option)}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-textPrimary transition hover:bg-[rgba(0,212,255,0.08)] hover:text-cyan"
              >
                {option}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-textMuted">No streams found</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
