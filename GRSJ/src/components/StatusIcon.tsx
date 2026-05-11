import type { TaskStatus } from '@/lib/types';

export default function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'pending') {
    return <span className="w-4 h-4 rounded-full border-2 border-muted-soft" />;
  }
  if (status === 'converting') {
    return (
      <svg className="w-4 h-4 animate-spin-icon text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" />
      </svg>
    );
  }
  if (status === 'done') {
    return (
      <span className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"><path d="M2 5l2 2 4-4"/></svg>
      </span>
    );
  }
  return (
    <span className="w-4 h-4 rounded-full bg-error flex items-center justify-center">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2"><path d="M2 2l4 4M6 2l-4 4"/></svg>
    </span>
  );
}
