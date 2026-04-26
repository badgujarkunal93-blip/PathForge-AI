import LoadingSpinner from './LoadingSpinner';

const variants = {
  primary:
    'border-transparent bg-gradient-to-r from-cyan to-violet text-[#0A0D14] shadow-glow hover:shadow-glowStrong',
  outlined:
    'border-cyan bg-transparent text-cyan hover:bg-[rgba(0,212,255,0.08)] hover:shadow-glow',
  danger:
    'border-danger bg-transparent text-danger hover:bg-[rgba(255,68,68,0.08)]',
};

export default function NeonButton({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 py-3 font-heading text-sm font-bold transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
        fullWidth ? 'w-full' : ''
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <LoadingSpinner className="h-5 w-5" /> : null}
      <span>{children}</span>
    </button>
  );
}
