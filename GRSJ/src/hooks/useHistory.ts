'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry } from '@/lib/types';
import { saveHistory, getHistoryEntries, removeHistoryEntry, clearHistory } from '@/lib/db';

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const load = useCallback(async () => {
    setEntries(await getHistoryEntries());
  }, []);

  useEffect(() => { load(); }, [load]);

  const addEntry = useCallback(async (entry: HistoryEntry) => {
    await saveHistory(entry);
    await load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await removeHistoryEntry(id);
    await load();
  }, [load]);

  const clear = useCallback(async () => {
    await clearHistory();
    await load();
  }, [load]);

  return { entries, isOpen, setIsOpen, addEntry, remove, clear };
}
