'use client';

interface HeaderProps {
  historyCount: number;
  onHistoryClick: () => void;
}

export default function Header({ historyCount, onHistoryClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            FileConverter
          </span>
        </div>
        <button
          onClick={onHistoryClick}
          className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                     text-[var(--color-text-secondary)] bg-[var(--color-card)]
                     border border-[var(--color-border)] rounded-[var(--radius-btn)]
                     hover:bg-[var(--color-bg)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6.5"/>
            <path d="M8 4.5V8l2.5 1.5"/>
          </svg>
          历史
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-semibold
                             bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center">
              {historyCount > 99 ? '99+' : historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
