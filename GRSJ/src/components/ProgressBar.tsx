'use client';

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-[6px] rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)] transition-all duration-300 ease-out relative overflow-hidden"
        style={{ width: `${Math.min(progress, 100)}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
