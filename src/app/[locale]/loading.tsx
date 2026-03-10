export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="w-8 h-8 rounded-full border-2 border-[var(--151-border-medium)] border-t-[var(--151-magenta-500)] animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
