'use client';

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-[6px] rounded-full bg-surface-soft border border-hairline overflow-hidden">
      <div
        className="h-full rounded-full bg-coral transition-all duration-300 ease-out relative overflow-hidden"
        style={{ width: `${Math.min(progress, 100)}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
