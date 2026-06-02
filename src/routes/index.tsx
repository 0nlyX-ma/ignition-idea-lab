import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Coffee,
  Share2,
  Check,
  Copy,
  Shuffle,
  Search,
  Bookmark,
  TrendingUp,
  X as XClose,
  Youtube,
  Linkedin,
  Send,
  Sparkles,
  Dices,
  Combine,
  History as HistoryIcon,
  Trash2,
  Target,
  Kanban,
  Flame,
  Plus,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import {
  IDEAS,
  MIXER_PICKS,
  NICHES,
  PLATFORMS,
  ALL_IDEAS,
  IDEAS_BY_ID,
  type Idea,
  type NicheKey,
  type Platform,
} from "@/lib/ideas";
import { IdeaCard, parseSlots, ATTRIBUTION } from "@/components/IdeaCard";
import { useBookmarks, useCopyCounts, getNewBadgeIds, useDailyChallenge, useStreakTracker } from "@/lib/storage";
import { useHistory, useKofiBanner } from "@/lib/history";
import {
  usePipeline,
  hashString,
  msUntilMidnight,
  formatCountdown,
  PIPELINE_COLUMNS,
  type PipelineColumn,
  type PipelineItem,
} from "@/lib/engagement";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Creator Engine — Stop guessing what goes viral" },
      {
        name: "description",
        content:
          "Editable viral title formulas, anti-hooks, pacing outlines and a Pattern DNA visualizer. Slot Machine, Remix Lab, and shareable filled hooks. 100% free.",
      },
      { property: "og:title", content: "Creator Engine — Stop guessing what goes viral" },
      {
        property: "og:description",
        content:
          "Edit the brackets, remix two formulas into a hybrid, or spin the Slot Machine. Built for creators who ship.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:ital,wght@0,500;1,500&family=JetBrains+Mono:wght@500;700&display=swap",
      },
    ],
  }),
});

const KOFI_URL = "https://ko-fi.com/espressocontext";

const PLATFORM_ICONS: Record<Platform, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  tiktok: TikTokIcon,
  x: XIcon,
  linkedin: Linkedin,
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16 3v3.2a4.8 4.8 0 0 0 4.8 4.8V14a8 8 0 0 1-4.8-1.6V17a6 6 0 1 1-6-6h1v3.2H10a2.8 2.8 0 1 0 2.8 2.8V3H16z" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2H21l-6.55 7.49L22 22h-6.83l-4.79-6.27L4.8 22H2.04l7.02-8.02L2 2h6.95l4.33 5.74L18.244 2zm-2.4 18h1.84L7.27 4h-1.9l10.47 16z" />
    </svg>
  );
}

function KofiButton({ size = "md", label = "Buy me an Espresso" }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const sizes = { sm: "px-3.5 py-2 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" } as const;
  return (
    <a
      href={KOFI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center gap-2 ${sizes[size]} rounded-full font-semibold text-[color:var(--background)] overflow-hidden`}
      style={{
        background: "linear-gradient(135deg, var(--copper), color-mix(in oklab, var(--copper) 60%, var(--teal)))",
        boxShadow:
          "0 8px 28px -8px color-mix(in oklab, var(--copper) 65%, transparent), inset 0 1px 0 color-mix(in oklab, white 24%, transparent)",
      }}
    >
      <Coffee className="w-4 h-4 relative" />
      <span className="relative tracking-tight">{label}</span>
    </a>
  );
}

type TabKey = NicheKey | "collection" | "history" | "pipeline";

// Curated wordbank for the Slot Machine variable reel
const VAR_BANK = [
  "Notion", "ChatGPT", "Cursor", "Figma", "Linear", "Stripe", "Raycast", "Obsidian",
  "Claude", "Vercel", "Substack", "Loom", "Beehiiv", "Webflow", "Framer", "Bolt",
  "5-minute", "90-day", "Sunday-night", "12-hour", "30-day", "$100/mo", "$10k MRR",
  "freelance", "agency", "indie hacker", "morning", "deep-work", "Pomodoro",
];

function Index() {
  const [tab, setTab] = useState<TabKey>("tech-ai");
  const [query, setQuery] = useState("");
  const [activePlatforms, setActivePlatforms] = useState<Set<Platform>>(new Set());
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [shared, setShared] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [slotOpen, setSlotOpen] = useState(false);
  const [remixMode, setRemixMode] = useState(false);
  const [remixPicks, setRemixPicks] = useState<string[]>([]);
  const [remixResult, setRemixResult] = useState<Idea | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<{ id: string; values: Record<number, string> } | null>(null);

  const { ids: bookmarkIds, toggle: toggleBookmark, has: isBookmarked } = useBookmarks();
  const { counts, bump } = useCopyCounts();
  const { entries: history, log: logHistory, clear: clearHistory } = useHistory();
  const totalCopies = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const kofi = useKofiBanner(totalCopies);
  const challenge = useDailyChallenge();
  const pipeline = usePipeline();
  const visitStreak = useStreakTracker();
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    setNewIds(getNewBadgeIds(ALL_IDEAS.map((i) => i.id)));
  }, []);

  // URL hash prefill: #id=X&v0=A&v1=B...
  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => {
      const h = window.location.hash.replace(/^#/, "");
      if (!h) return;
      const params = new URLSearchParams(h);
      const id = params.get("id");
      if (!id || !IDEAS_BY_ID[id]) return;
      const values: Record<number, string> = {};
      for (const [k, v] of params.entries()) {
        if (k.startsWith("v")) {
          const idx = Number(k.slice(1));
          if (!Number.isNaN(idx)) values[idx] = v;
        }
      }
      setPrefill({ id, values });
      setFocusedId(id);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // Reseed when tab changes
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1e9));
  }, [tab]);

  const togglePlatform = (p: Platform) => {
    setActivePlatforms((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const trending = useMemo(() => {
    return Object.entries(counts)
      .map(([id, c]) => ({ idea: IDEAS_BY_ID[id], count: c }))
      .filter((x) => x.idea)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [counts]);

  const filtered = useMemo(() => {
    let pool: Idea[];
    if (tab === "collection") {
      pool = bookmarkIds.map((id) => IDEAS_BY_ID[id]).filter(Boolean) as Idea[];
    } else if (tab === "history" || tab === "pipeline") {
      pool = [];
    } else {
      pool = [...IDEAS[tab]];
    }
    const q = query.trim().toLowerCase();
    if (q) {
      pool = pool.filter(
        (i) =>
          i.formula.toLowerCase().includes(q) ||
          i.hook.toLowerCase().includes(q) ||
          i.why.toLowerCase().includes(q),
      );
    }
    if (activePlatforms.size) {
      pool = pool.filter((i) => i.platforms.some((p) => activePlatforms.has(p)));
    }
    const rng = mulberry32(seed);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 12);
  }, [tab, query, activePlatforms, seed, bookmarkIds]);

  const mixer = useMemo(() => {
    if (tab === "collection" || tab === "history" || tab === "pipeline" || query) return null;
    const rng = mulberry32(seed + 7);
    return MIXER_PICKS[Math.floor(rng() * MIXER_PICKS.length)];
  }, [tab, query, seed]);

  // Living hero: rotates daily, biased to featured
  const heroIdea = useMemo<Idea>(() => {
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const featured = ALL_IDEAS.filter((i) => i.featured);
    return featured[today % featured.length] ?? ALL_IDEAS[0];
  }, []);

  const shuffle = () => {
    setShuffling(true);
    setSeed(Math.floor(Math.random() * 1e9));
    setTimeout(() => setShuffling(false), 450);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    } catch {}
  };

  const handleShareFormula = useCallback(async (id: string, values: Record<number, string>) => {
    const params = new URLSearchParams();
    params.set("id", id);
    Object.entries(values).forEach(([k, v]) => {
      if (v && v.trim()) params.set(`v${k}`, v.trim());
    });
    const url = `${window.location.origin}${window.location.pathname}#${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    if (window.history.replaceState) {
      window.history.replaceState(null, "", `#${params.toString()}`);
    }
  }, []);

  const handleRemixSelect = useCallback((id: string) => {
    setRemixPicks((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const next = [...prev, id].slice(-2);
      if (next.length === 2) {
        const a = IDEAS_BY_ID[next[0]];
        const b = IDEAS_BY_ID[next[1]];
        if (a && b) {
          setTimeout(() => setRemixResult(buildRemix(a, b)), 350);
        }
      }
      return next;
    });
  }, []);

  const closeRemix = () => {
    setRemixResult(null);
    setRemixPicks([]);
  };

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
          <nav className="glass-subtle rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2 group">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, var(--copper), var(--teal))",
                  boxShadow: "0 0 18px -2px color-mix(in oklab, var(--copper) 55%, transparent)",
                }}
              >
                <Zap className="w-4 h-4 text-[color:var(--background)]" />
              </span>
              <span className="font-bold tracking-tight text-lg font-display">
                Creator <span className="text-gradient-brand">Engine</span>
              </span>
            </a>
            <div className="flex items-center gap-2">
              <KofiButton size="sm" />
              <StreakBadge count={visitStreak} />
            </div>
          </nav>
        </div>
      </header>

      {/* LIVING HERO CARD */}
      <section className="pt-28 sm:pt-32 pb-8 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <IdeaCard
            idea={heroIdea}
            hero
            onCopy={bump}
            onShare={handleShareFormula}
          />
          <p className="mt-5 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            Click any <span className="text-[color:var(--copper)] font-semibold">[bracket]</span> and start typing — the formula rebalances itself live. Hit{" "}
            <span className="font-mono text-[color:var(--copper)]">Share</span> to copy a link with your variables baked in.
          </p>
        </div>
      </section>

      {/* QUICK STATS */}
      <QuickStatsBar
        copied={totalCopies}
        saved={bookmarkIds.length}
        pipeline={pipeline.items.length}
        streak={visitStreak}
      />

      {/* DAILY CHALLENGE */}
      <DailyChallengeCard
        heroId={heroIdea.id}
        completedToday={challenge.completedToday}
        streak={challenge.streak}
        onComplete={challenge.complete}
        onCopy={bump}
        onShare={handleShareFormula}
        onLogHistory={logHistory}
        onAddToPipeline={pipeline.add}
        bookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
      />


      {/* CONTROL BAR: Niches + Stuck + Remix */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-center max-w-2xl mx-auto px-2"
          >
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-foreground/95">
              Battle-tested title formulas for creators who actually ship.
            </h2>
            <p className="mt-1.5 text-sm sm:text-[15px] text-muted-foreground">
              Pick your niche → fill the{" "}
              <span className="text-[color:var(--copper)] font-semibold">[brackets]</span> → copy. No AI fluff, no blank page.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-2.5"
            role="tablist"
          >
            {NICHES.map((n) => {
              const total = IDEAS[n.key].length;
              const done = IDEAS[n.key].filter((i) => (counts[i.id] ?? 0) > 0).length;
              return (
                <TabPill
                  key={n.key}
                  active={tab === n.key}
                  onClick={() => setTab(n.key)}
                  label={n.label}
                  progress={{ done, total }}
                />
              );
            })}
            <TabPill
              active={tab === "collection"}
              onClick={() => setTab("collection")}
              label={
                <span className="inline-flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  My Collection
                  {bookmarkIds.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[color:var(--background)]/30 text-[10px] font-bold">
                      {bookmarkIds.length}
                    </span>
                  )}
                </span>
              }
            />
            <TabPill
              active={tab === "pipeline"}
              onClick={() => setTab("pipeline")}
              label={
                <span className="inline-flex items-center gap-1.5">
                  <Kanban className="w-3.5 h-3.5" />
                  Pipeline
                  {pipeline.items.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[color:var(--background)]/30 text-[10px] font-bold">
                      {pipeline.items.length}
                    </span>
                  )}
                </span>
              }
            />
            <TabPill
              active={tab === "history"}
              onClick={() => setTab("history")}
              label={
                <span className="inline-flex items-center gap-1.5">
                  <HistoryIcon className="w-3.5 h-3.5" />
                  History
                  {history.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[color:var(--background)]/30 text-[10px] font-bold">
                      {history.length}
                    </span>
                  )}
                </span>
              }
            />
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <motion.button
              onClick={() => setSlotOpen(true)}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm tracking-tight text-[color:var(--background)] relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--copper), var(--copper-bright))",
                boxShadow:
                  "0 0 0 1px color-mix(in oklab, var(--copper) 60%, transparent), 0 14px 38px -12px color-mix(in oklab, var(--copper) 70%, transparent)",
              }}
            >
              <Dices className="w-4 h-4" />
              I'm Stuck — Spin
            </motion.button>

            <motion.button
              onClick={shuffle}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              className="hidden sm:inline-flex shuffle-border relative items-center gap-2.5 px-5 py-3 rounded-full font-bold text-sm tracking-tight overflow-hidden card-brushed"
            >
              <motion.span
                aria-hidden
                animate={{ rotate: shuffling ? 360 : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Shuffle className="w-4 h-4 text-[color:var(--copper)]" />
              </motion.span>
              <span className="text-gradient-brand">Shuffle Grid</span>
            </motion.button>

            <button
              onClick={() => { setRemixMode((v) => !v); setRemixPicks([]); }}
              aria-pressed={remixMode}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm tracking-tight transition-all border ${
                remixMode
                  ? "bg-[color:var(--copper)]/20 border-[color:var(--copper)]/60 text-[color:var(--copper)] shadow-[0_0_22px_-4px_color-mix(in_oklab,var(--copper)_70%,transparent)]"
                  : "glass-subtle border-transparent text-foreground/80 hover:text-foreground"
              }`}
            >
              <Combine className="w-4 h-4" />
              Remix Lab {remixMode && `· pick ${2 - remixPicks.length}`}
            </button>
          </div>

          {/* Platform filters + search */}
          <div className="w-full max-w-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search — 'AI', 'money', 'morning'…"
                className="w-full glass rounded-full pl-11 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[color:var(--copper)]/60 transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-[color:var(--secondary)]/60"
                >
                  <XClose className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              {PLATFORMS.map((p) => {
                const Ico = PLATFORM_ICONS[p.key];
                const active = activePlatforms.has(p.key);
                return (
                  <button
                    key={p.key}
                    onClick={() => togglePlatform(p.key)}
                    aria-pressed={active}
                    title={p.label}
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-all ${
                      active
                        ? "bg-[color:var(--copper)] text-[color:var(--background)] border-[color:var(--copper)]"
                        : "border-[color:var(--copper)]/20 text-foreground/70 hover:text-foreground hover:border-[color:var(--copper)]/50"
                    }`}
                  >
                    <Ico className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="px-4 sm:px-6 pb-6">
          <div className="mx-auto max-w-5xl">
            <div className="card-brushed rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[color:var(--copper)]" />
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--copper)]">
                  Trending — most copied by you
                </h2>
              </div>
              <ol className="space-y-2.5">
                {trending.map((t, i) => (
                  <li key={t.idea.id} className="flex items-start gap-3 text-sm">
                    <span className="font-bold text-[color:var(--teal)] w-6 shrink-0 font-display text-base">#{i + 1}</span>
                    <span className="text-foreground/90 flex-1">{t.idea.formula}</span>
                    <span className="text-xs text-muted-foreground shrink-0 font-mono" style={{ fontFamily: "var(--font-mono)" }}>{t.count}×</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* GRID */}
      <main className="px-4 sm:px-6 pb-32 sm:pb-24">
        <div className="mx-auto max-w-7xl">
          {tab === "history" ? (
            <HistoryPanel entries={history} onClear={clearHistory} />
          ) : tab === "pipeline" ? (
            <PipelinePanel
              items={pipeline.items}
              onMove={pipeline.move}
              onRemove={pipeline.remove}
            />
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${tab}-${seed}-${query}-${[...activePlatforms].join(",")}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filtered.length === 0 ? (
                    <EmptyState tab={tab} clear={() => { setQuery(""); setActivePlatforms(new Set()); }} />
                  ) : (
                    <>
                      {filtered.map((idea, i) => (
                        focusedId === idea.id ? (
                          <div key={`${idea.id}-${seed}-ghost`} className="opacity-0 pointer-events-none" aria-hidden />
                        ) : (
                          <IdeaCard
                            key={`${idea.id}-${seed}`}
                            idea={idea}
                            index={i}
                            layoutId={`card-${idea.id}`}
                            isNew={newIds.has(idea.id)}
                            bookmarked={isBookmarked(idea.id)}
                            onToggleBookmark={toggleBookmark}
                            onCopy={bump}
                            onShare={handleShareFormula}
                            onLogHistory={logHistory}
                            remixActive={remixMode}
                            remixSelected={remixPicks.includes(idea.id)}
                            onRemixSelect={handleRemixSelect}
                            onExpand={(id) => !remixMode && setFocusedId(id)}
                            initialValues={prefill?.id === idea.id ? prefill.values : undefined}
                            onAddToPipeline={pipeline.add}
                          />
                        )
                      ))}
                      {mixer && focusedId !== mixer.id && (
                        <IdeaCard
                          key={`${mixer.id}-${seed}-mx`}
                          idea={mixer}
                          index={filtered.length}
                          variant="mixer"
                          layoutId={`card-${mixer.id}`}
                          isNew={newIds.has(mixer.id)}
                          bookmarked={isBookmarked(mixer.id)}
                          onToggleBookmark={toggleBookmark}
                          onCopy={bump}
                          onShare={handleShareFormula}
                          onLogHistory={logHistory}
                          remixActive={remixMode}
                          remixSelected={remixPicks.includes(mixer.id)}
                          onRemixSelect={handleRemixSelect}
                          onExpand={(id) => !remixMode && setFocusedId(id)}
                          onAddToPipeline={pipeline.add}
                        />
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Tap the <span className="text-[color:var(--teal)] font-semibold">expand icon</span> (or double-click any title) to enter{" "}
                <span className="text-[color:var(--copper)] font-semibold">Focus Mode</span>.
              </p>
            </>
          )}
        </div>
      </main>

      {/* MOBILE STICKY SHUFFLE */}
      <div className="sm:hidden fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none">
        <motion.button
          onClick={shuffle}
          whileTap={{ scale: 0.96 }}
          className="pointer-events-auto w-full shuffle-border relative inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm tracking-tight overflow-hidden card-brushed"
        >
          <motion.span aria-hidden animate={{ rotate: shuffling ? 360 : 0 }} transition={{ duration: 0.5 }}>
            <Shuffle className="w-4 h-4 text-[color:var(--copper)]" />
          </motion.span>
          <span className="text-gradient-brand">Shuffle Grid</span>
        </motion.button>
      </div>

      {/* KO-FI BANNER (after 10+ copies) */}
      <AnimatePresence>
        {kofi.show && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 sm:px-6 pb-6"
          >
            <div
              className="mx-auto max-w-3xl card-brushed rounded-2xl p-4 sm:p-5 flex items-center gap-4 relative"
              style={{
                border: "1px solid color-mix(in oklab, var(--copper) 55%, transparent)",
                boxShadow: "0 12px 40px -16px color-mix(in oklab, var(--copper) 55%, transparent)",
              }}
            >
              <div
                className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--copper), var(--teal))",
                  boxShadow: "0 0 22px -4px color-mix(in oklab, var(--copper) 60%, transparent)",
                }}
              >
                <Coffee className="w-5 h-5 text-[color:var(--background)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-[15px] font-semibold text-foreground/95 leading-snug">
                  You've copied 10+ formulas today. Fuel the engine? ☕
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Every espresso ships more formulas — and keeps this tool 100% free.
                </p>
              </div>
              <a
                href={KOFI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-[color:var(--background)]"
                style={{
                  background: "linear-gradient(135deg, var(--copper), var(--copper-bright))",
                  boxShadow: "0 8px 24px -8px color-mix(in oklab, var(--copper) 60%, transparent)",
                }}
              >
                <Coffee className="w-4 h-4" />
                Buy a coffee
              </a>
              <button
                onClick={kofi.dismiss}
                aria-label="Dismiss"
                className="absolute top-2 right-2 w-7 h-7 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-[color:var(--secondary)]/70"
              >
                <XClose className="w-4 h-4" />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="px-4 sm:px-6 pb-24 sm:pb-16">
        <div className="mx-auto max-w-4xl">
          <div
            className="card-brushed rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, var(--copper) 16%, transparent), transparent 70%)",
            }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-gradient font-display">
              Loving these frameworks?
            </h2>
            <p className="mt-3 text-muted-foreground">Fuel the engine. Every espresso ships more formulas.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <KofiButton size="lg" label="Buy me an Espresso" />
              <button
                onClick={share}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold glass hover:bg-[color:var(--secondary)] transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {shared ? (
                    <motion.span key="ok" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="inline-flex items-center gap-2">
                      <Check className="w-4 h-4 text-[color:var(--success)]" />
                      Link copied!
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Tool
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={() => setSubmitOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold glass hover:bg-[color:var(--secondary)] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[color:var(--copper)]" />
                Submit a Formula
              </button>
            </div>
            <p className="mt-6 text-[11px] text-muted-foreground/80">
              Every copy includes:{" "}
              <span className="font-mono text-[color:var(--copper)]/80" style={{ fontFamily: "var(--font-mono)" }}>
                ⚡ Generated with Creator Engine | creator-engine.app
              </span>
            </p>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            Built for creators who ship. © {new Date().getFullYear()} Creator Engine.
          </p>
        </div>
      </footer>

      <SubmitModal open={submitOpen} onClose={() => setSubmitOpen(false)} />
      <SlotMachineModal open={slotOpen} onClose={() => setSlotOpen(false)} onCopy={bump} onShare={handleShareFormula} />

      {/* FOCUS MODE OVERLAY */}
      <AnimatePresence>
        {focusedId && IDEAS_BY_ID[focusedId] && (
          <motion.div
            key="focus"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
            style={{
              background: "color-mix(in oklab, black 65%, transparent)",
              backdropFilter: "blur(14px) saturate(120%)",
              WebkitBackdropFilter: "blur(14px) saturate(120%)",
            }}
            onClick={() => setFocusedId(null)}
          >
            <button
              onClick={() => setFocusedId(null)}
              aria-label="Exit focus mode"
              className="absolute top-5 right-5 w-10 h-10 inline-flex items-center justify-center rounded-full glass hover:bg-[color:var(--secondary)] transition-colors z-10"
            >
              <XClose className="w-5 h-5" />
            </button>
            <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <IdeaCard
                idea={IDEAS_BY_ID[focusedId]}
                layoutId={`card-${focusedId}`}
                forceOpen
                onCopy={bump}
                onShare={handleShareFormula}
                bookmarked={isBookmarked(focusedId)}
                onToggleBookmark={toggleBookmark}
                initialValues={prefill?.id === focusedId ? prefill.values : undefined}
                onAddToPipeline={pipeline.add}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REMIX RESULT */}
      <AnimatePresence>
        {remixResult && (
          <motion.div
            key="remix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
            style={{
              background: "color-mix(in oklab, black 70%, transparent)",
              backdropFilter: "blur(14px)",
            }}
            onClick={closeRemix}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-[color:var(--copper)]/15 text-[color:var(--copper)] border border-[color:var(--copper)]/40">
                  <Combine className="w-3.5 h-3.5" /> Remix Result
                </span>
              </div>
              <IdeaCard
                idea={remixResult}
                variant="remix"
                forceOpen
                onCopy={bump}
                onShare={handleShareFormula}
              />
              <div className="mt-4 flex justify-center">
                <button
                  onClick={closeRemix}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold glass hover:bg-[color:var(--secondary)]"
                >
                  <XClose className="w-4 h-4" /> Close Remix
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * Helpers
 * ========================================================= */

function HistoryPanel({
  entries,
  onClear,
}: {
  entries: { text: string; ts: number }[];
  onClear: () => void;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyAgain = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  };

  const fmtTime = (ts: number) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl glass-subtle flex items-center justify-center mb-5">
          <HistoryIcon className="w-7 h-7 text-[color:var(--copper)]" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-display text-gradient mb-2">
          No copies yet.
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Fill some brackets and hit "Copy Formula" — your last 50 will live here for easy re-use.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-4 h-4 text-[color:var(--copper)]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--copper)]">
            Title History — {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </h2>
        </div>
      </div>
      <ul className="space-y-2.5">
        {entries.map((e, i) => (
          <motion.li
            key={`${e.ts}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
            className="card-brushed rounded-xl p-4 flex items-start gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[15px] leading-snug text-foreground/95 font-medium font-display">
                {e.text}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5 font-mono" style={{ fontFamily: "var(--font-mono)" }}>
                {fmtTime(e.ts)} · {e.text.length} chars
              </p>
            </div>
            <button
              onClick={() => copyAgain(e.text, i)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[color:var(--secondary)]/70 hover:bg-[color:var(--secondary)] border border-[color:var(--copper)]/20 transition-colors"
            >
              {copiedIdx === i ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[color:var(--success)]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy again
                </>
              )}
            </button>
          </motion.li>
        ))}
      </ul>
      <div className="mt-6 flex justify-center">
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-[color:var(--destructive)] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear history
        </button>
      </div>
    </div>
  );
}

function buildRemix(a: Idea, b: Idea): Idea {
  // Hybrid formula: take first half of A's slots/text + second half of B's
  const aParts = parseSlots(a.formula);
  const bParts = parseSlots(b.formula);
  const aHalf = aParts.slice(0, Math.ceil(aParts.length / 2)).map((p) => (p.kind === "text" ? p.value : `[${p.placeholder}]`)).join("");
  const bHalf = bParts.slice(Math.floor(bParts.length / 2)).map((p) => (p.kind === "text" ? p.value : `[${p.placeholder}]`)).join("");
  const conj = " × ";
  const formula = `${aHalf.trim().replace(/[.,;:]\s*$/, "")}${conj}${bHalf.trim()}`;
  const hook = `${a.hook.split(/(?<=\.)\s/)[0]} ${b.hook.split(/(?<=\.)\s/).slice(-1)[0]}`;
  const score = Number(((a.score + b.score) / 2 + 1).toFixed(1));
  const avg = (k: keyof Idea["psyScores"]) =>
    Math.min(99, Math.round((a.psyScores[k] + b.psyScores[k]) / 2) + 2);
  return {
    id: `remix-${a.id}-${b.id}`,
    score,
    formula,
    hook,
    why: `Cross-pattern fusion: ${a.psychology} + ${b.psychology}. Hybrid formulas land because they import surprise from one niche into another.`,
    niche: "mixer",
    platforms: Array.from(new Set([...a.platforms, ...b.platforms])).slice(0, 4) as Platform[],
    antiHook: a.antiHook,
    outline: a.outline,
    psychology: "Hybrid fusion — two proven patterns layered.",
    psyScores: { curiosity: avg("curiosity"), novelty: avg("novelty"), authority: avg("authority") },
    featured: true,
  };
}

function TabPill({
  active,
  onClick,
  label,
  progress,
}: {
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
  progress?: { done: number; total: number };
}) {
  const pct = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={progress ? `${progress.done}/${progress.total} copied` : undefined}
      className={`relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold transition-colors group ${
        active ? "text-[color:var(--background)]" : "text-foreground/80 hover:text-foreground glass-subtle"
      }`}
    >
      {active && (
        <motion.span
          layoutId="niche-pill"
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, var(--copper), var(--teal))",
            boxShadow: "0 8px 30px -8px color-mix(in oklab, var(--copper) 60%, transparent)",
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">
        {label}
        {progress && progress.done > 0 && (
          <span
            className={`text-[10px] font-mono opacity-70 ${
              active ? "text-[color:var(--background)]" : "text-muted-foreground"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {progress.done}/{progress.total}
          </span>
        )}
      </span>
      {progress && !active && progress.done > 0 && (
        <span
          aria-hidden
          className="absolute left-3 right-3 bottom-1 h-[2px] rounded-full overflow-hidden opacity-60"
          style={{ background: "color-mix(in oklab, var(--copper) 18%, transparent)" }}
        >
          <span
            className="block h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--teal), var(--copper))",
            }}
          />
        </span>
      )}
    </button>
  );
}

function EmptyState({ tab, clear }: { tab: TabKey; clear: () => void }) {
  const isCollection = tab === "collection";
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="col-span-full text-center py-20 px-6">
      <div className="mx-auto w-16 h-16 rounded-2xl glass-subtle flex items-center justify-center mb-5">
        {isCollection ? <Bookmark className="w-7 h-7 text-[color:var(--copper)]" /> : <Search className="w-7 h-7 text-[color:var(--copper)]" />}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold font-display text-gradient mb-2">
        {isCollection ? "Your collection is empty." : "Even the algorithm couldn't find that."}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
        {isCollection ? "Hit the bookmark on any formula and it'll wait for you here." : "Try a different keyword, or clear the platform filters."}
      </p>
      {!isCollection && (
        <button onClick={clear} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold glass hover:bg-[color:var(--secondary)] transition-colors">
          Clear filters
        </button>
      )}
    </motion.div>
  );
}

/* =========================================================
 * Slot Machine
 * ========================================================= */
function SlotMachineModal({
  open,
  onClose,
  onCopy,
  onShare,
}: {
  open: boolean;
  onClose: () => void;
  onCopy: (id: string) => void;
  onShare: (id: string, values: Record<number, string>) => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ idea: Idea; values: Record<number, string> } | null>(null);
  const [reels, setReels] = useState<{ niche: string[]; formula: string[]; variable: string[] }>(() => buildReels());

  useEffect(() => {
    if (open) {
      setResult(null);
    }
  }, [open]);

  const spin = () => {
    setSpinning(true);
    setResult(null);
    const fresh = buildReels();
    setReels(fresh);
    setTimeout(() => {
      // Pick a random idea, then pre-fill its first slot with a random var.
      const idea = ALL_IDEAS[Math.floor(Math.random() * ALL_IDEAS.length)];
      const slots = parseSlots(idea.formula);
      const values: Record<number, string> = {};
      const firstSlot = slots.find((s) => s.kind === "slot");
      if (firstSlot) values[firstSlot.key] = VAR_BANK[Math.floor(Math.random() * VAR_BANK.length)];
      setResult({ idea, values });
      setSpinning(false);
    }, 2400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="card-brushed rounded-3xl w-full max-w-2xl p-6 sm:p-8 relative"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 w-9 h-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-[color:var(--secondary)]/70"
            >
              <XClose className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Dices className="w-5 h-5 text-[color:var(--copper)]" />
              <h3 className="text-2xl font-bold font-display text-gradient">Idea Roulette</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Three reels. One guaranteed idea. Spin until something clicks.</p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <Reel items={reels.niche} spinning={spinning} delay={0} label="Niche" />
              <Reel items={reels.formula} spinning={spinning} delay={300} label="Pattern" />
              <Reel items={reels.variable} spinning={spinning} delay={600} label="Variable" />
            </div>

            <div className="flex justify-center mb-5">
              <motion.button
                onClick={spin}
                disabled={spinning}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm tracking-tight text-[color:var(--background)] disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, var(--copper), var(--copper-bright))",
                  boxShadow: "0 14px 38px -12px color-mix(in oklab, var(--copper) 70%, transparent)",
                }}
              >
                <Dices className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
                {spinning ? "Spinning…" : result ? "Spin Again" : "Spin Reels"}
              </motion.button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <IdeaCard
                    idea={result.idea}
                    forceOpen
                    initialValues={result.values}
                    onCopy={onCopy}
                    onShare={onShare}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function buildReels() {
  const formulas = ALL_IDEAS.map((i) => i.formula.replace(/\[[^\]]+\]/g, "___").slice(0, 36));
  return {
    niche: shuffleArr(NICHES.map((n) => n.label).concat(["Mixer"])).slice(0, 20),
    formula: shuffleArr(formulas).slice(0, 20),
    variable: shuffleArr(VAR_BANK).slice(0, 20),
  };
}
function shuffleArr<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function Reel({ items, spinning, delay, label }: { items: string[]; spinning: boolean; delay: number; label: string }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [y, setY] = useState(0);
  const itemH = 72; // matches CSS
  const looped = useMemo(() => [...items, ...items, ...items], [items]);

  useEffect(() => {
    if (spinning) {
      // Spin: animate to a tall offset, then settle to a random index after delay
      const total = items.length;
      const target = Math.floor(Math.random() * total);
      setY(0);
      const start = setTimeout(() => {
        setY(-(total * 4 + target) * itemH);
      }, 30);
      const settle = setTimeout(() => {
        setY(-(total * 2 + target) * itemH);
      }, 1900 + delay);
      return () => { clearTimeout(start); clearTimeout(settle); };
    }
  }, [spinning, items, delay]);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--copper)]/80 font-bold text-center mb-1.5">{label}</p>
      <div className="reel">
        <motion.div
          ref={trackRef}
          className="reel-track"
          animate={{ y }}
          transition={
            spinning
              ? { duration: 1.9 + delay / 1000, ease: [0.22, 0.8, 0.2, 1] }
              : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {looped.map((s, i) => (
            <div key={i} className="reel-item truncate" title={s}>
              {s}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================
 * Submit Modal
 * ========================================================= */
function SubmitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ title: "", hook: "", platform: "youtube" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSent(false);
        setForm({ title: "", hook: "", platform: "youtube" });
      }, 250);
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(`Title: ${form.title}\nHook: ${form.hook}\nPlatform: ${form.platform}${ATTRIBUTION}`);
    window.location.href = `mailto:hello@creator-engine.app?subject=${encodeURIComponent("New Formula Submission")}&body=${body}`;
    setSent(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="card-brushed rounded-2xl w-full max-w-md p-6 sm:p-7 relative"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 w-8 h-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-[color:var(--secondary)]/70"
            >
              <XClose className="w-4 h-4" />
            </button>
            <h3 className="text-2xl font-bold font-display text-gradient mb-1">Submit a Formula</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Got a hook that's printing views? Share it. We'll ship the best ones in the next drop.
            </p>

            {sent ? (
              <div className="py-6 text-center">
                <Check className="w-8 h-8 mx-auto text-[color:var(--success)] mb-2" />
                <p className="text-sm">Thanks — your draft email is open. Hit send to deliver it.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <Field label="Title formula">
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="The [Number]-second prompt that just killed [Tool]"
                    className="modal-input"
                  />
                </Field>
                <Field label="Opening hook">
                  <textarea
                    required
                    rows={3}
                    value={form.hook}
                    onChange={(e) => setForm({ ...form, hook: e.target.value })}
                    placeholder="The one sentence you'd open the video with…"
                    className="modal-input resize-none"
                  />
                </Field>
                <Field label="Platform">
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="modal-input"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </Field>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[color:var(--copper)] to-[color:var(--teal)] text-[color:var(--background)] hover:brightness-110 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Send Formula
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* =========================================================
 * StreakBadge (nav)
 * ========================================================= */
function StreakBadge({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold glass-subtle border border-[color:var(--copper)]/30 hover:border-[color:var(--copper)]/60 transition-colors"
        title="Visit streak"
      >
        <Flame className="w-3.5 h-3.5 text-[color:var(--copper)]" />
        <span className="text-[color:var(--copper)] font-mono" style={{ fontFamily: "var(--font-mono)" }}>{count}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-64 p-4 rounded-xl glass shadow-2xl z-30"
          >
            <p className="text-sm font-semibold text-foreground/95 mb-1">
              You've visited <span className="text-[color:var(--copper)]">{count}</span> day{count === 1 ? "" : "s"} in a row.
            </p>
            <p className="text-[12px] text-muted-foreground">Keep the streak alive! Come back tomorrow to push it to {count + 1}.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * QuickStatsBar
 * ========================================================= */
function QuickStatsBar({ copied, saved, pipeline, streak }: { copied: number; saved: number; pipeline: number; streak: number }) {
  const stats = [
    { icon: "📋", label: "copied", value: copied },
    { icon: "🔖", label: "saved", value: saved },
    { icon: "📁", label: "in pipeline", value: pipeline },
    { icon: "🔥", label: "day streak", value: streak },
  ];
  return (
    <section className="px-4 sm:px-6 pb-4">
      <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-2">
        {stats.map((s) => (
          <span
            key={s.label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] glass-subtle border border-[color:var(--copper)]/15 text-foreground/80"
          >
            <span aria-hidden>{s.icon}</span>
            <span className="font-mono font-bold text-foreground" style={{ fontFamily: "var(--font-mono)" }}>{s.value}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
 * DailyChallengeCard
 * ========================================================= */
function DailyChallengeCard({
  heroId,
  completedToday,
  streak,
  onComplete,
  onCopy,
  onShare,
  onLogHistory,
  onAddToPipeline,
  bookmarked,
  onToggleBookmark,
}: {
  heroId: string;
  completedToday: boolean;
  streak: number;
  onComplete: (id: string) => void;
  onCopy: (id: string) => void;
  onShare: (id: string, values: Record<number, string>) => void;
  onLogHistory: (text: string) => void;
  onAddToPipeline: (text: string, niche: string) => void;
  bookmarked: (id: string) => boolean;
  onToggleBookmark: (id: string) => void;
}) {
  const dailyIdea = useMemo<Idea>(() => {
    // Deterministic daily pick: hero index offset by 7 (different from hero)
    const seed = hashString(new Date().toDateString());
    const heroIdx = Math.max(0, ALL_IDEAS.findIndex((i) => i.id === heroId));
    const idx = (heroIdx + 7 + (seed % ALL_IDEAS.length)) % ALL_IDEAS.length;
    const picked = ALL_IDEAS[idx];
    return picked && picked.id !== heroId ? picked : ALL_IDEAS[(idx + 1) % ALL_IDEAS.length];
  }, [heroId]);

  const [countdown, setCountdown] = useState(() => formatCountdown(msUntilMidnight()));
  useEffect(() => {
    const t = setInterval(() => setCountdown(formatCountdown(msUntilMidnight())), 1000);
    return () => clearInterval(t);
  }, []);

  const [sharedFlash, setSharedFlash] = useState(false);
  const shareToday = async () => {
    const text =
      `🎯 Today's Creator Engine formula:\n\n"${dailyIdea.formula}"\n\nHook: ${dailyIdea.hook}\n\nFree tool → creatorengine.netlify.app`;
    try {
      await navigator.clipboard.writeText(text);
      setSharedFlash(true);
      setTimeout(() => setSharedFlash(false), 1600);
    } catch {}
  };

  return (
    <section className="px-4 sm:px-6 pb-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card-brushed rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-colors"
          style={{
            border: completedToday
              ? "1px solid color-mix(in oklab, var(--success) 45%, transparent)"
              : "1px solid color-mix(in oklab, var(--copper) 35%, transparent)",
            boxShadow: completedToday
              ? "0 18px 60px -24px color-mix(in oklab, var(--success) 45%, transparent)"
              : "0 18px 60px -24px color-mix(in oklab, var(--copper) 50%, transparent)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[color:var(--copper)]/15 text-[color:var(--copper)] border border-[color:var(--copper)]/40">
                <Target className="w-3 h-3" />
                Today's Challenge
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono glass-subtle text-foreground/80"
                style={{ fontFamily: "var(--font-mono)" }}
                title="Resets at midnight (local)"
              >
                ⏳ {countdown}
              </span>
            </div>
          </div>

          <IdeaCard
            idea={dailyIdea}
            forceOpen
            onCopy={onCopy}
            onShare={onShare}
            onLogHistory={onLogHistory}
            bookmarked={bookmarked(dailyIdea.id)}
            onToggleBookmark={onToggleBookmark}
            onAddToPipeline={onAddToPipeline}
          />

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {completedToday ? (
              <span
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold"
                style={{
                  background: "color-mix(in oklab, var(--success) 15%, transparent)",
                  color: "var(--success)",
                  border: "1px solid color-mix(in oklab, var(--success) 45%, transparent)",
                }}
              >
                <Check className="w-4 h-4" />
                Done for today ✓ — come back tomorrow
              </span>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onComplete(dailyIdea.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm tracking-tight text-[color:var(--background)]"
                style={{
                  background: "linear-gradient(135deg, var(--copper), var(--copper-bright))",
                  boxShadow: "0 12px 32px -10px color-mix(in oklab, var(--copper) 65%, transparent)",
                }}
              >
                <Target className="w-4 h-4" />
                Complete Challenge
              </motion.button>
            )}

            <button
              onClick={shareToday}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold glass hover:bg-[color:var(--secondary)] transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {sharedFlash ? (
                  <motion.span key="ok" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="inline-flex items-center gap-2">
                    <Check className="w-4 h-4 text-[color:var(--success)]" /> Copied!
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Share Today's Formula
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {streak > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--copper)]">
              <Flame className="w-4 h-4" /> {streak} day streak
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================
 * Pipeline Kanban
 * ========================================================= */
function PipelinePanel({
  items,
  onMove,
  onRemove,
}: {
  items: PipelineItem[];
  onMove: (id: string, column: PipelineColumn) => void;
  onRemove: (id: string) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<PipelineColumn | null>(null);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-2 mb-4">
        <Kanban className="w-4 h-4 text-[color:var(--copper)]" />
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--copper)]">
          Pipeline — {items.length} {items.length === 1 ? "item" : "items"}
        </h2>
        <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">Drag cards between columns</span>
      </div>

      {items.length === 0 && (
        <p className="text-center text-sm text-muted-foreground mb-5">
          Hit the <span className="inline-flex items-center gap-1"><Plus className="w-3 h-3" /></span> button on any formula to drop it into your pipeline.
        </p>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {PIPELINE_COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.column === col.key);
          const isOver = dragOver === col.key;
          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
              onDragLeave={() => setDragOver((prev) => (prev === col.key ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) onMove(dragId, col.key);
                setDragId(null);
                setDragOver(null);
              }}
              className={`rounded-2xl p-3 transition-all ${
                isOver
                  ? "bg-[color:var(--copper)]/10 ring-2 ring-[color:var(--copper)]/60"
                  : "glass-subtle"
              }`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[11px] uppercase tracking-[0.16em] font-bold text-[color:var(--teal)]">
                  {col.label}
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                  {colItems.length}
                </span>
              </div>
              <div className="space-y-2.5 min-h-[120px]">
                <AnimatePresence initial={false}>
                  {colItems.map((it) => (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.22 }}
                      draggable
                      onDragStart={() => setDragId(it.id)}
                      onDragEnd={() => { setDragId(null); setDragOver(null); }}
                      className={`card-brushed rounded-xl p-3 cursor-grab active:cursor-grabbing ${
                        dragId === it.id ? "opacity-50" : ""
                      }`}
                    >
                      <p className="text-[13.5px] leading-snug text-foreground/95 font-medium" style={{ fontFamily: "var(--font-display)" }}>
                        {it.text}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[color:var(--teal)]/12 text-[color:var(--teal)] border border-[color:var(--teal)]/30">
                          {it.niche}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                          {new Date(it.addedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => onRemove(it.id)}
                          aria-label="Delete"
                          className="ml-auto w-7 h-7 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-[color:var(--destructive)] hover:bg-[color:var(--secondary)]/70 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colItems.length === 0 && (
                  <div
                    className="rounded-xl border border-dashed border-[color:var(--copper)]/20 py-8 text-center text-[11px] text-muted-foreground/70"
                  >
                    Drop ideas here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
