import { get, set, del, keys, createStore } from 'idb-keyval';
import type { HistoryEntry } from './types';

const store = createStore('fileconverter-db', 'entries');

export async function saveHistory(entry: HistoryEntry): Promise<void> {
  await set(entry.id, entry, store);
}

export async function getHistoryEntries(): Promise<HistoryEntry[]> {
  const allKeys = await keys(store);
  const entries: HistoryEntry[] = [];
  for (const key of allKeys) {
    const entry = await get<HistoryEntry>(key, store);
    if (entry) entries.push(entry);
  }
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getHistoryEntry(id: string): Promise<HistoryEntry | undefined> {
  return get<HistoryEntry>(id, store);
}

export async function removeHistoryEntry(id: string): Promise<void> {
  const entry = await get<HistoryEntry>(id, store);
  if (entry?.blobUrl) URL.revokeObjectURL(entry.blobUrl);
  await del(id, store);
}

export async function clearHistory(): Promise<void> {
  const entries = await getHistoryEntries();
  for (const entry of entries) {
    if (entry.blobUrl) URL.revokeObjectURL(entry.blobUrl);
  }
  const allKeys = await keys(store);
  for (const key of allKeys) {
    await del(key, store);
  }
}
