import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Coffee,
  Share2,
  Check,
  Shuffle,
  Search,
  Bookmark,
  TrendingUp,
  X as XClose,
  Youtube,
  Linkedin,
  Send,
  Sparkles,
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
import { IdeaCard } from "@/components/IdeaCard";
import { useBookmarks, useCopyCounts, getNewBadgeIds } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Creator Engine — Stop guessing what goes viral" },
      {
        name: "description",
        content:
          "Battle-tested title formulas, hooks, anti-hooks and pacing outlines for creators. Edit, save, and remix 120+ patterns. 100% free.",
      },
      { property: "og:title", content: "Creator Engine — Stop guessing what goes viral" },
      {
        property: "og:description",
        content:
          "120+ editable title patterns, anti-hook warnings, and 3-bullet outlines — curated from Base 5's top wins. Free.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:ital,wght@0,500;1,500&display=swap",
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

type TabKey = NicheKey | "collection";

function Index() {
  const [tab, setTab] = useState<TabKey>("tech-ai");
  const [query, setQuery] = useState("");
  const [activePlatforms, setActivePlatforms] = useState<Set<Platform>>(new Set());
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [shared, setShared] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const { ids: bookmarkIds, toggle: toggleBookmark, has: isBookmarked } = useBookmarks();
  const { counts, bump } = useCopyCounts();
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    setNewIds(getNewBadgeIds(ALL_IDEAS.map((i) => i.id)));
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
    const ranked = Object.entries(counts)
      .map(([id, c]) => ({ idea: IDEAS_BY_ID[id], count: c }))
      .filter((x) => x.idea)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    return ranked;
  }, [counts]);

  const filtered = useMemo(() => {
    let pool: Idea[];
    if (tab === "collection") {
      pool = bookmarkIds.map((id) => IDEAS_BY_ID[id]).filter(Boolean) as Idea[];
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
    // Deterministic shuffle by seed
    const rng = mulberry32(seed);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 12);
  }, [tab, query, activePlatforms, seed, bookmarkIds]);

  const mixer = useMemo(() => {
    if (tab === "collection" || query) return null;
    const rng = mulberry32(seed + 7);
    return MIXER_PICKS[Math.floor(rng() * MIXER_PICKS.length)];
  }, [tab, query, seed]);

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
            <KofiButton size="sm" />
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 sm:pt-40 pb-6 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--copper)] pulse-dot" />
            120+ formulas · Editable · No signup · Saved locally
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gradient leading-[1.04] font-display"
          >
            Stop guessing<br />what goes viral.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Edit the brackets. Steal the hooks. Skip the anti-hooks.{" "}
            <span className="text-foreground font-medium">100% free</span>{" "}
            <span className="text-[color:var(--copper)]">(curated from Base 5's top wins).</span>
          </motion.p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { n: "01", t: "Pick a framework", d: "Browse 120+ patterns across 4 niches." },
              { n: "02", t: "Swap the variables", d: "Edit the [brackets] directly on the card." },
              { n: "03", t: "Record & post", d: "Copy your version. Ship it before lunch." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="glass-subtle rounded-xl px-4 py-3.5 flex items-center gap-3"
              >
                <span className="text-2xl font-bold tracking-tight text-gradient-brand font-display">{s.n}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground/95">{s.t}</p>
                  <p className="text-xs text-muted-foreground">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="px-4 sm:px-6 pb-8">
          <div className="mx-auto max-w-5xl">
            <div className="card-brushed rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[color:var(--copper)]" />
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--copper)]">
                  Trending — most copied by you
                </h2>
              </div>
              <ol className="space-y-2.5">
                {trending.map((t, i) => (
                  <li key={t.idea.id} className="flex items-start gap-3 text-sm">
                    <span className="font-bold text-[color:var(--teal)] w-6 shrink-0 font-display text-base">
                      #{i + 1}
                    </span>
                    <span className="text-foreground/90 flex-1">{t.idea.formula}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{t.count}×</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* SEARCH */}
      <section className="px-4 sm:px-6 pb-5">
        <div className="mx-auto max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search formulas — try 'AI', 'money', 'morning'…"
            className="w-full glass rounded-full pl-11 pr-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[color:var(--copper)]/60 transition-colors"
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
      </section>

      {/* TABS + PLATFORM FILTER */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-2.5"
            role="tablist"
          >
            {NICHES.map((n) => (
              <TabPill key={n.key} active={tab === n.key} onClick={() => setTab(n.key)} label={n.label} />
            ))}
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
          </motion.div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Filter:</span>
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
                      ? "bg-[color:var(--copper)] text-[color:var(--background)] border-[color:var(--copper)] shadow-[0_0_18px_-4px_color-mix(in_oklab,var(--copper)_70%,transparent)]"
                      : "border-[color:var(--copper)]/20 text-foreground/70 hover:text-foreground hover:border-[color:var(--copper)]/50"
                  }`}
                >
                  <Ico className="w-4 h-4" />
                </button>
              );
            })}
            {activePlatforms.size > 0 && (
              <button
                onClick={() => setActivePlatforms(new Set())}
                className="ml-1 text-xs text-muted-foreground hover:text-foreground"
              >
                clear
              </button>
            )}
          </div>

          {/* Desktop shuffle */}
          <motion.button
            onClick={shuffle}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            className="hidden sm:inline-flex shuffle-border relative items-center gap-3 px-7 py-3.5 rounded-2xl font-bold text-base tracking-tight overflow-hidden card-brushed"
            style={{
              boxShadow:
                "0 18px 60px -16px color-mix(in oklab, var(--copper) 60%, transparent), 0 0 0 1px color-mix(in oklab, var(--copper) 30%, transparent)",
            }}
          >
            <motion.span
              aria-hidden
              animate={{ rotate: shuffling ? 360 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Shuffle className="w-5 h-5 text-[color:var(--copper)]" />
            </motion.span>
            <span className="relative text-gradient-brand">Shuffle Creator Patterns</span>
          </motion.button>
        </div>
      </section>

      {/* GRID */}
      <main className="px-4 sm:px-6 pb-32 sm:pb-24">
        <div className="mx-auto max-w-7xl">
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
                    <IdeaCard
                      key={`${idea.id}-${seed}`}
                      idea={idea}
                      index={i}
                      isNew={newIds.has(idea.id)}
                      bookmarked={isBookmarked(idea.id)}
                      onToggleBookmark={toggleBookmark}
                      onCopy={bump}
                    />
                  ))}
                  {mixer && (
                    <IdeaCard
                      key={`${mixer.id}-${seed}-mx`}
                      idea={mixer}
                      index={filtered.length}
                      variant="mixer"
                      isNew={newIds.has(mixer.id)}
                      bookmarked={isBookmarked(mixer.id)}
                      onToggleBookmark={toggleBookmark}
                      onCopy={bump}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* MOBILE STICKY SHUFFLE */}
      <div className="sm:hidden fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none">
        <motion.button
          onClick={shuffle}
          whileTap={{ scale: 0.96 }}
          className="pointer-events-auto w-full shuffle-border relative inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm tracking-tight overflow-hidden card-brushed"
          style={{
            boxShadow:
              "0 22px 60px -18px color-mix(in oklab, var(--copper) 70%, transparent), 0 0 0 1px color-mix(in oklab, var(--copper) 35%, transparent)",
          }}
        >
          <motion.span aria-hidden animate={{ rotate: shuffling ? 360 : 0 }} transition={{ duration: 0.5 }}>
            <Shuffle className="w-4 h-4 text-[color:var(--copper)]" />
          </motion.span>
          <span className="text-gradient-brand">Shuffle Patterns</span>
        </motion.button>
      </div>

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
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-[color:var(--success)]" />
                      Link copied!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2"
                    >
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
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            Built for creators who ship. © {new Date().getFullYear()} Creator Engine.
          </p>
        </div>
      </footer>

      <SubmitModal open={submitOpen} onClose={() => setSubmitOpen(false)} />
    </div>
  );
}

function TabPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
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
      <span className="relative">{label}</span>
    </button>
  );
}

function EmptyState({ tab, clear }: { tab: TabKey; clear: () => void }) {
  const isCollection = tab === "collection";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full text-center py-20 px-6"
    >
      <div className="mx-auto w-16 h-16 rounded-2xl glass-subtle flex items-center justify-center mb-5">
        {isCollection ? (
          <Bookmark className="w-7 h-7 text-[color:var(--copper)]" />
        ) : (
          <Search className="w-7 h-7 text-[color:var(--copper)]" />
        )}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold font-display text-gradient mb-2">
        {isCollection ? "Your collection is empty." : "Even the algorithm couldn't find that."}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
        {isCollection
          ? "Hit the bookmark on any formula and it'll wait for you here."
          : "Try a different keyword, or clear the platform filters."}
      </p>
      {!isCollection && (
        <button
          onClick={clear}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold glass hover:bg-[color:var(--secondary)] transition-colors"
        >
          Clear filters
        </button>
      )}
    </motion.div>
  );
}

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
    // Mock submission: open mailto with prefilled body
    const body = encodeURIComponent(
      `Title: ${form.title}\nHook: ${form.hook}\nPlatform: ${form.platform}`,
    );
    window.location.href = `mailto:hello@creatorengine.app?subject=${encodeURIComponent(
      "New Formula Submission",
    )}&body=${body}`;
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
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
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
      <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-1.5 block">
        {label}
      </span>
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
