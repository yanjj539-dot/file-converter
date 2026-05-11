import type { ConversionTask } from '@/lib/types';
import { getTargetFormats } from '@/lib/formats';

interface FormatSelectProps {
  task: ConversionTask;
  onChange: (format: string) => void;
}

export default function FormatSelect({ task, onChange }: FormatSelectProps) {
  const targets = getTargetFormats(task.sourceFormat);
  if (task.status !== 'pending') {
    return <span className="text-sm text-[var(--color-text-secondary)]">{task.targetFormat.toUpperCase()}</span>;
  }

  return (
    <select
      value={task.targetFormat}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-btn)]
                 px-2 py-1 text-[var(--color-text-primary)] outline-none
                 focus:border-[var(--color-accent)] transition-colors"
    >
      {targets.map(f => (
        <option key={f.extension} value={f.extension}>{f.label}</option>
      ))}
    </select>
  );
}
