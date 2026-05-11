import type { ConversionTask } from '@/lib/types';
import { getTargetFormats } from '@/lib/formats';

interface FormatSelectProps {
  task: ConversionTask;
  onChange: (format: string) => void;
}

export default function FormatSelect({ task, onChange }: FormatSelectProps) {
  const targets = getTargetFormats(task.sourceFormat);
  if (task.status !== 'pending') {
    return <span className="text-body-sm text-muted">{task.targetFormat.toUpperCase()}</span>;
  }
  return (
    <select
      value={task.targetFormat}
      onChange={(e) => onChange(e.target.value)}
      className="text-body-sm bg-canvas border border-hairline rounded-md
                 px-2 py-1 text-ink outline-none focus:border-coral transition-colors"
    >
      {targets.map(f => <option key={f.extension} value={f.extension}>{f.label}</option>)}
    </select>
  );
}
