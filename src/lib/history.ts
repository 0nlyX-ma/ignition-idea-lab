import { useCallback, useEffect, useState } from "react";

export type HistoryEntry = { text: string; ts: number };

const HISTORY_KEY = "ce.history.v1";
const MAX_ENTRIES = 50;

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const v = window.localStorage.getItem(HISTORY_KEY);
    return v ? (JSON.parse(v) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {}
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => read());
  useEffect(() => write(entries), [entries]);

  const log = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setEntries((prev) => {
      const next = [{ text: trimmed, ts: Date.now() }, ...prev.filter((e) => e.text !== trimmed)];
      return next.slice(0, MAX_ENTRIES);
    });
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, log, clear };
}

const KOFI_DISMISSED_KEY = "ce.kofi.dismissed.v1";

export function useKofiBanner(totalCopies: number) {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(KOFI_DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(KOFI_DISMISSED_KEY, "1");
    } catch {}
  }, []);
  return { show: !dismissed && totalCopies >= 10, dismiss };
}
