import { useCallback, useEffect, useRef, useState } from "react";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const BOOKMARKS_KEY = "ce.bookmarks.v1";
const COPY_COUNTS_KEY = "ce.copyCounts.v1";
const NEW_BADGES_KEY = "ce.newBadges.v1";

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>(() => read<string[]>(BOOKMARKS_KEY, []));
  useEffect(() => write(BOOKMARKS_KEY, ids), [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, toggle, has };
}

export function useCopyCounts() {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    read<Record<string, number>>(COPY_COUNTS_KEY, {}),
  );
  useEffect(() => write(COPY_COUNTS_KEY, counts), [counts]);
  const bump = useCallback((id: string) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);
  return { counts, bump };
}

/** Stable random ~10% "new" set, persisted per session. */
export function getNewBadgeIds(allIds: string[]): Set<string> {
  if (typeof window === "undefined") return new Set();
  const stored = read<{ ids: string[]; ts: number } | null>(NEW_BADGES_KEY, null);
  const sixHours = 1000 * 60 * 60 * 6;
  if (stored && Date.now() - stored.ts < sixHours) {
    return new Set(stored.ids);
  }
  const fresh = allIds.filter(() => Math.random() < 0.1);
  write(NEW_BADGES_KEY, { ids: fresh, ts: Date.now() });
  return new Set(fresh);
}
