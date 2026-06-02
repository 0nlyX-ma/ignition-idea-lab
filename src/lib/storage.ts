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

/* =========================================================
 * Daily Challenge — ce.challenges.v1
 * Stores at most 90 { date, formulaId } records.
 * ========================================================= */
const CHALLENGES_KEY = "ce.challenges.v1";
export type ChallengeRecord = { date: string; formulaId: string };

export function useDailyChallenge() {
  const [records, setRecords] = useState<ChallengeRecord[]>(() =>
    read<ChallengeRecord[]>(CHALLENGES_KEY, []),
  );
  const skip = useRef(true);
  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    write(CHALLENGES_KEY, records);
  }, [records]);

  const todayStr = new Date().toDateString();
  const completedToday = records.some((r) => r.date === todayStr);

  const complete = useCallback(
    (formulaId: string) => {
      setRecords((prev) => {
        if (prev.some((r) => r.date === todayStr)) return prev;
        const next = [...prev, { date: todayStr, formulaId }];
        return next.length > 90 ? next.slice(next.length - 90) : next;
      });
    },
    [todayStr],
  );

  // Consecutive day streak ending today (or yesterday if not yet done today)
  const dates = new Set(records.map((r) => r.date));
  let streak = 0;
  const d = new Date();
  if (!dates.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (dates.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return { records, completedToday, complete, streak };
}

/* =========================================================
 * Visit Streak — ce.streak.v1
 * Increments on consecutive-day opens, resets on >1 day gap.
 * ========================================================= */
const STREAK_KEY = "ce.streak.v1";
export type StreakState = { lastDate: string; count: number };

export function useStreakTracker() {
  const [state, setState] = useState<StreakState>(() =>
    read<StreakState>(STREAK_KEY, { lastDate: "", count: 0 }),
  );
  const skip = useRef(true);
  useEffect(() => {
    if (skip.current) {
      skip.current = false;
    } else {
      write(STREAK_KEY, state);
    }
  }, [state]);

  useEffect(() => {
    const today = new Date().toDateString();
    setState((prev) => {
      if (prev.lastDate === today && prev.count > 0) return prev;
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toDateString();
      const nextCount = prev.lastDate === yStr ? prev.count + 1 : 1;
      return { lastDate: today, count: nextCount };
    });
  }, []);

  return Math.max(1, state.count);
}
