'use client';

interface HeaderProps {
  historyCount: number;
  onHistoryClick: () => void;
}

export default function Header({ historyCount, onHistoryClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-hairline">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="font-display text-title-lg text-ink tracking-tight">
          FileConverter
        </span>
        <button
          onClick={onHistoryClick}
          className="relative inline-flex items-center gap-1.5 px-4 py-2 text-button text-muted
                     bg-canvas border border-hairline rounded-md hover:bg-surface-soft transition-colors"
          style={{ height: '40px' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/>
          </svg>
          历史
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-semibold
                             bg-coral text-white rounded-full flex items-center justify-center">
              {historyCount > 99 ? '99+' : historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
