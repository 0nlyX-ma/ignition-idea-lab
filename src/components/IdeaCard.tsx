import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, ChevronDown, Info, Flame, Sparkles } from "lucide-react";
import type { Idea } from "@/lib/ideas";

function highlightBrackets(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((p, i) =>
    p.startsWith("[") && p.endsWith("]") ? (
      <span
        key={i}
        className="text-[color:var(--copper)] font-bold"
        style={{
          textShadow:
            "0 0 22px color-mix(in oklab, var(--copper) 45%, transparent)",
        }}
      >
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function IdeaCard({
  idea,
  index,
  variant = "default",
}: {
  idea: Idea;
  index: number;
  variant?: "default" | "mixer";
}) {
  const [open, setOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [copied, setCopied] = useState<"formula" | "hook" | null>(null);

  const copy = async (kind: "formula" | "hook", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1400);
    } catch {}
  };

  const isMixer = variant === "mixer";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`${isMixer ? "card-mixer" : "card-brushed"} rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden group`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isMixer
            ? "radial-gradient(600px circle at 50% -20%, color-mix(in oklab, var(--copper) 22%, transparent), transparent 60%)"
            : "radial-gradient(600px circle at 50% -20%, color-mix(in oklab, var(--teal) 18%, transparent), transparent 60%)",
        }}
      />

      <div className="flex items-center justify-between relative flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--secondary)]/60 border ${
              isMixer
                ? "border-[color:var(--copper)]/50"
                : "border-[color:var(--teal)]/40"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full pulse-dot ${
                isMixer ? "bg-[color:var(--copper)]" : "bg-[color:var(--teal)]"
              }`}
            />
            <span
              className={`text-xs font-semibold tracking-wide ${
                isMixer ? "text-[color:var(--copper)]" : "text-[color:var(--teal)]"
              }`}
            >
              {idea.score.toFixed(1)}% Score
            </span>
          </div>

          {/* Info tooltip trigger */}
          <button
            onMouseEnter={() => setTipOpen(true)}
            onMouseLeave={() => setTipOpen(false)}
            onFocus={() => setTipOpen(true)}
            onBlur={() => setTipOpen(false)}
            onClick={() => setTipOpen((o) => !o)}
            aria-label="Why this works"
            className="relative inline-flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-[color:var(--copper)] hover:bg-[color:var(--secondary)]/70 transition-colors"
          >
            <Info className="w-4 h-4" />
            <AnimatePresence>
              {tipOpen && (
                <motion.span
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  role="tooltip"
                  className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-2 w-64 sm:w-72 text-left p-3 rounded-xl text-[12px] leading-snug font-normal text-foreground/90 glass shadow-2xl"
                  style={{
                    boxShadow:
                      "0 18px 50px -10px color-mix(in oklab, var(--copper) 25%, transparent)",
                  }}
                >
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-[color:var(--copper)] font-semibold mb-1">
                    Why this works
                  </span>
                  {idea.why}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isMixer ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--copper)]/15 text-[color:var(--copper)] border border-[color:var(--copper)]/40">
              <Sparkles className="w-3 h-3" /> Mixer Pick
            </span>
          ) : idea.featured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--copper)]/12 text-[color:var(--copper)] border border-[color:var(--copper)]/35">
              <Flame className="w-3 h-3" /> Featured
            </span>
          ) : null}
        </div>
      </div>

      <h3
        className="text-[1.4rem] md:text-2xl leading-[1.15] font-bold tracking-tight relative font-display"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {highlightBrackets(idea.formula)}
      </h3>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
          View Script Hook
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/90 border-l-2 border-[color:var(--copper)]/60 pl-4 italic">
                "{idea.hook}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 relative">
        <CopyBtn
          label="Copy Formula"
          active={copied === "formula"}
          onClick={() => copy("formula", idea.formula)}
          variant="primary"
        />
        <CopyBtn
          label="Copy Hook"
          active={copied === "hook"}
          onClick={() => copy("hook", idea.hook)}
          variant="ghost"
        />
      </div>
    </motion.article>
  );
}

function CopyBtn({
  label,
  active,
  onClick,
  variant,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all active:scale-[0.97]";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-[color:var(--copper)] to-[color:var(--teal)] text-[color:var(--background)] hover:brightness-110 shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--copper)_50%,transparent)]"
      : "bg-[color:var(--secondary)]/70 text-foreground/90 hover:bg-[color:var(--secondary)] border border-[color:var(--copper)]/15";
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <motion.span
            key="ok"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-[color:var(--success)]" />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
