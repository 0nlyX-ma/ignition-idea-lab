import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Coffee, Share2, Check, Shuffle } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { IDEAS, MIXER_PICKS, NICHES, type Idea, type NicheKey } from "@/lib/ideas";
import { IdeaCard } from "@/components/IdeaCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Creator Engine — Stop guessing what goes viral" },
      {
        name: "description",
        content:
          "Unlock the exact cognitive biases and title patterns that drive millions of views. 120+ battle-tested formulas across Tech, Gaming, Solopreneur & Productivity. 100% free.",
      },
      { property: "og:title", content: "Creator Engine — Stop guessing what goes viral" },
      {
        property: "og:description",
        content:
          "120+ battle-tested title patterns and hook starters, curated from Base 5's top wins. Free idea generator for creators.",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Fraunces:ital,wght@0,500;1,500&display=swap",
      },
    ],
  }),
});

const KOFI_URL = "https://ko-fi.com/espressocontext";

function KofiButton({
  size = "md",
  label = "Buy me an Espresso",
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizes = {
    sm: "px-3.5 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  } as const;
  return (
    <a
      href={KOFI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center gap-2 ${sizes[size]} rounded-full font-semibold text-[color:var(--background)] overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, var(--copper), color-mix(in oklab, var(--copper) 60%, var(--teal)))",
        boxShadow:
          "0 8px 28px -8px color-mix(in oklab, var(--copper) 65%, transparent), inset 0 1px 0 color-mix(in oklab, white 24%, transparent)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, white 22%, transparent), transparent 60%)",
        }}
      />
      <Coffee className="w-4 h-4 relative" />
      <span className="relative tracking-tight">{label}</span>
    </a>
  );
}

const SHUFFLE_SIZE = 8; // 7 niche + 1 mixer pick = 8 cards

function pickShuffle(niche: NicheKey, seed: number): {
  ideas: Idea[];
  mixer: Idea;
} {
  // deterministic-ish using seed so re-render keeps the same set
  const pool = [...IDEAS[niche]];
  const rng = mulberry32(seed);

  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Ensure at least one featured
  const featuredInPool = pool.filter((p) => p.featured);
  let chosen = pool.slice(0, SHUFFLE_SIZE - 1);
  if (featuredInPool.length && !chosen.some((c) => c.featured)) {
    chosen[chosen.length - 1] = featuredInPool[0];
  }

  // Pick mixer
  const mixer = MIXER_PICKS[Math.floor(rng() * MIXER_PICKS.length)];

  return { ideas: chosen, mixer };
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Index() {
  const [niche, setNiche] = useState<NicheKey>("tech-ai");
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1e9));
  const [shared, setShared] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  // Re-seed when niche changes
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1e9));
  }, [niche]);

  const { ideas, mixer } = pickShuffle(niche, seed);

  const shuffle = useCallback(() => {
    setShuffling(true);
    setSeed(Math.floor(Math.random() * 1e9));
    setTimeout(() => setShuffling(false), 450);
  }, []);

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
                  background:
                    "linear-gradient(135deg, var(--copper), var(--teal))",
                  boxShadow:
                    "0 0 18px -2px color-mix(in oklab, var(--copper) 55%, transparent)",
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
            120+ formulas · No signup · Curated from Base 5's top wins
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
            Unlock the exact cognitive biases and title patterns that drive
            millions of views.{" "}
            <span className="text-foreground font-medium">100% free</span>{" "}
            <span className="text-[color:var(--copper)]">
              (curated from Base 5's top wins).
            </span>
          </motion.p>
        </div>
      </section>

      {/* SHUFFLE + NICHE CONTROL */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-6">
          <motion.button
            onClick={shuffle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            className="shuffle-border relative inline-flex items-center gap-3 px-7 sm:px-9 py-4 sm:py-4.5 rounded-2xl font-bold text-base sm:text-lg tracking-tight overflow-hidden card-brushed"
            style={{
              boxShadow:
                "0 18px 60px -16px color-mix(in oklab, var(--copper) 60%, transparent), 0 0 0 1px color-mix(in oklab, var(--copper) 30%, transparent)",
            }}
          >
            <motion.span
              aria-hidden
              animate={{ rotate: shuffling ? 360 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative inline-flex items-center justify-center"
            >
              <Shuffle className="w-5 h-5 text-[color:var(--copper)]" />
            </motion.span>
            <span className="relative text-gradient-brand">
              Shuffle Creator Patterns
            </span>
            <span
              aria-hidden
              className="absolute -inset-2 rounded-2xl opacity-50 blur-2xl -z-10"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklab, var(--copper) 50%, transparent), transparent)",
              }}
            />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-2.5"
            role="tablist"
          >
            {NICHES.map((n) => {
              const active = n.key === niche;
              return (
                <button
                  key={n.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setNiche(n.key)}
                  className={`relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? "text-[color:var(--background)]"
                      : "text-foreground/80 hover:text-foreground glass-subtle"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="niche-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--copper), var(--teal))",
                        boxShadow:
                          "0 8px 30px -8px color-mix(in oklab, var(--copper) 60%, transparent)",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">{n.label}</span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* GRID */}
      <main className="px-4 sm:px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${niche}-${seed}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {ideas.map((idea, i) => (
                <IdeaCard key={`${idea.id}-${seed}`} idea={idea} index={i} />
              ))}
              <IdeaCard
                key={`${mixer.id}-${seed}-mx`}
                idea={mixer}
                index={ideas.length}
                variant="mixer"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER / VIRAL */}
      <footer className="px-4 sm:px-6 pb-16">
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
            <p className="mt-3 text-muted-foreground">
              Fuel the engine. Every espresso ships more formulas.
            </p>
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
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            Built for creators who ship. © {new Date().getFullYear()} Creator Engine.
          </p>
        </div>
      </footer>
    </div>
  );
}
