"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 mb-6">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--151-text-primary)] mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-[var(--151-text-secondary)] mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--151-magenta-500)] hover:bg-[var(--151-magenta-400)] transition-[background-color] duration-200"
      >
        Try Again
      </button>
    </div>
  );
}
