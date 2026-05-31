import { useCallback, useEffect, useState } from "react";

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

/* ===== Daily Challenge ===== */
const CHALLENGE_KEY = "ce.challenges.v1";
export type ChallengeRecord = { date: string; formulaId: string };

export function useChallenge() {
  const [records, setRecords] = useState<ChallengeRecord[]>(() =>
    read<ChallengeRecord[]>(CHALLENGE_KEY, []),
  );
  useEffect(() => write(CHALLENGE_KEY, records), [records]);

  const todayStr = new Date().toDateString();
  const completedToday = records.some((r) => r.date === todayStr);

  const complete = useCallback(
    (formulaId: string) => {
      setRecords((prev) =>
        prev.some((r) => r.date === todayStr)
          ? prev
          : [...prev, { date: todayStr, formulaId }],
      );
    },
    [todayStr],
  );

  // Streak: count consecutive completion days ending today (or yesterday if today not done yet)
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

/* ===== Pipeline (kanban) ===== */
const PIPELINE_KEY = "ce.pipeline.v1";
export type PipelineColumn = "ideas" | "drafting" | "recording" | "published";
export type PipelineItem = {
  id: string;
  text: string;
  niche: string;
  column: PipelineColumn;
  addedAt: number;
};

export const PIPELINE_COLUMNS: { key: PipelineColumn; label: string }[] = [
  { key: "ideas", label: "Ideas" },
  { key: "drafting", label: "Drafting" },
  { key: "recording", label: "Recording" },
  { key: "published", label: "Published" },
];

export function usePipeline() {
  const [items, setItems] = useState<PipelineItem[]>(() =>
    read<PipelineItem[]>(PIPELINE_KEY, []),
  );
  useEffect(() => write(PIPELINE_KEY, items), [items]);

  const add = useCallback((text: string, niche: string) => {
    setItems((prev) => [
      {
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        niche,
        column: "ideas",
        addedAt: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const move = useCallback((id: string, column: PipelineColumn) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, column } : p)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { items, add, move, remove };
}

/* ===== Visit streak ===== */
const STREAK_KEY = "ce.streak.v1";
export type StreakState = { lastDate: string; count: number };

export function useVisitStreak() {
  const [state, setState] = useState<StreakState>(() =>
    read<StreakState>(STREAK_KEY, { lastDate: "", count: 0 }),
  );
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastDate === today && state.count > 0) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toDateString();
    const next = state.lastDate === yStr ? state.count + 1 : 1;
    const updated = { lastDate: today, count: next };
    write(STREAK_KEY, updated);
    setState(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return Math.max(1, state.count);
}

/* ===== Helpers ===== */
export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function msUntilMidnight() {
  const now = new Date();
  const m = new Date(now);
  m.setHours(24, 0, 0, 0);
  return m.getTime() - now.getTime();
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
