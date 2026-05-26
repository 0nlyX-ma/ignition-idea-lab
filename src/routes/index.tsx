import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Coffee, Share2, Check } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { IDEAS, NICHES, type NicheKey } from "@/lib/ideas";
import { IdeaCard } from "@/components/IdeaCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Creator Engine — Free Idea Generator for Creators" },
      {
        name: "description",
        content:
          "Steal battle-tested, high-engagement content frameworks and title formulas. 100% free idea generator for creators.",
      },
      { property: "og:title", content: "Creator Engine — Free Idea Generator for Creators" },
      {
        property: "og:description",
        content:
          "Battle-tested title formulas and hook starters across Tech & AI, Gaming, Solopreneur and Productivity.",
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
          "linear-gradient(135deg, color-mix(in oklab, var(--kofi) 100%, transparent), color-mix(in oklab, var(--mint-glow) 70%, var(--kofi)))",
        boxShadow:
          "0 8px 30px -8px color-mix(in oklab, var(--kofi) 70%, transparent), inset 0 1px 0 color-mix(in oklab, white 30%, transparent)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, white 25%, transparent), transparent 60%)",
        }}
      />
      <Coffee className="w-4 h-4 relative" />
      <span className="relative tracking-tight">{label}</span>
    </a>
  );
}

function Index() {
  const [niche, setNiche] = useState<NicheKey>("tech-ai");
  const [shared, setShared] = useState(false);

  const ideas = useMemo(
    () => [...IDEAS[niche]].sort((a, b) => b.score - a.score),
    [niche],
  );

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
          <nav className="glass rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2 group">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--indigo-glow), var(--mint-glow))",
                  boxShadow:
                    "0 0 18px -2px color-mix(in oklab, var(--indigo-glow) 60%, transparent)",
                }}
              >
                <Zap className="w-4 h-4 text-[color:var(--background)]" />
              </span>
              <span className="font-semibold tracking-tight text-lg">
                Creator <span className="text-gradient-brand">Engine</span>
              </span>
            </a>
            <KofiButton size="sm" />
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-36 sm:pt-44 pb-10 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--mint-glow)] pulse-dot" />
            100% free · No signup · Updated weekly
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gradient leading-[1.05]"
          >
            Stop staring at a<br />blank script.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Steal battle-tested, high-engagement content frameworks and title
            formulas. <span className="text-foreground">100% free.</span>
          </motion.p>

          {/* Niche selector */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-2.5"
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
                  className={`relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "text-[color:var(--background)]"
                      : "text-foreground/80 hover:text-foreground glass"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="niche-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--indigo-glow), var(--mint-glow))",
                        boxShadow:
                          "0 8px 30px -8px color-mix(in oklab, var(--indigo-glow) 70%, transparent)",
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
              key={niche}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {ideas.map((idea, i) => (
                <IdeaCard key={idea.id} idea={idea} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER / VIRAL */}
      <footer className="px-4 sm:px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <div
            className="glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, var(--indigo-glow) 18%, transparent), transparent 70%)",
            }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-gradient">
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
