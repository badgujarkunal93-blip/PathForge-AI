export default function LoadingSpinner({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={`animate-spin text-cyan ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-95"
        fill="currentColor"
        d="M22 12a10 10 0 0 1-10 10v-4a6 6 0 0 0 6-6h4Z"
      />
    </svg>
  );
}
