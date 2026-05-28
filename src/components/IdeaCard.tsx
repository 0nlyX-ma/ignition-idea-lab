import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  ChevronDown,
  Info,
  Flame,
  Sparkles,
  Bookmark,
  AlertTriangle,
  Youtube,
  Linkedin,
  Sparkle,
} from "lucide-react";
import type { Idea, Platform } from "@/lib/ideas";

const PLATFORM_ICON: Record<Platform, React.ComponentType<{ className?: string }>> = {
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

/** Parse a formula into static text + bracketed editable slots. */
function parseSlots(formula: string) {
  const parts = formula.split(/(\[[^\]]+\])/g);
  return parts.map((p, i) => {
    if (p.startsWith("[") && p.endsWith("]")) {
      return { kind: "slot" as const, placeholder: p.slice(1, -1), key: i };
    }
    return { kind: "text" as const, value: p, key: i };
  });
}

function buildFilled(
  formula: string,
  values: Record<number, string>,
  withBrackets = false,
) {
  const slots = parseSlots(formula);
  return slots
    .map((s) => {
      if (s.kind === "text") return s.value;
      const v = values[s.key]?.trim();
      if (v) return v;
      return withBrackets ? `[${s.placeholder}]` : `[${s.placeholder}]`;
    })
    .join("");
}

export function IdeaCard({
  idea,
  index,
  variant = "default",
  isNew = false,
  bookmarked = false,
  onToggleBookmark,
  onCopy,
}: {
  idea: Idea;
  index: number;
  variant?: "default" | "mixer";
  isNew?: boolean;
  bookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onCopy?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [copied, setCopied] = useState<"formula" | "hook" | null>(null);
  const [values, setValues] = useState<Record<number, string>>({});

  const slots = useMemo(() => parseSlots(idea.formula), [idea.formula]);

  const copy = async (kind: "formula" | "hook", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      onCopy?.(idea.id);
      setTimeout(() => setCopied(null), 1400);
    } catch {}
  };

  const isMixer = variant === "mixer";
  const accent = isMixer ? "var(--copper)" : "var(--teal)";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`${isMixer ? "card-mixer" : "card-brushed"} rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden group transition-shadow duration-300 hover:shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--copper)_45%,transparent)]`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at 50% -20%, color-mix(in oklab, ${accent} 22%, transparent), transparent 60%)`,
        }}
      />

      {/* TOP ROW: score + info + badges + bookmark */}
      <div className="flex items-start justify-between relative gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap relative">
          {/* Score badge — clickable popover */}
          <button
            onClick={() => setScoreOpen((o) => !o)}
            onMouseEnter={() => setScoreOpen(true)}
            onMouseLeave={() => setScoreOpen(false)}
            className={`score-glow inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--secondary)]/60 border ${
              isMixer ? "border-[color:var(--copper)]/50" : "border-[color:var(--teal)]/40"
            }`}
            aria-label="View psychology breakdown"
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
          </button>
          <AnimatePresence>
            {scoreOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 left-0 top-full mt-2 w-64 p-3 rounded-xl text-[12px] leading-snug font-normal text-foreground/90 glass shadow-2xl"
              >
                <span className="block text-[10px] uppercase tracking-[0.14em] text-[color:var(--teal)] font-semibold mb-1">
                  Viral psychology
                </span>
                {idea.psychology}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info tooltip */}
          <button
            onMouseEnter={() => setTipOpen(true)}
            onMouseLeave={() => setTipOpen(false)}
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
                >
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-[color:var(--copper)] font-semibold mb-1">
                    Why this works
                  </span>
                  {idea.why}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Platform pills */}
          <div className="hidden sm:flex items-center gap-1 ml-1">
            {idea.platforms.map((p) => {
              const I = PLATFORM_ICON[p];
              return (
                <span
                  key={p}
                  title={p}
                  className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-[color:var(--secondary)]/60 text-foreground/60"
                >
                  <I className="w-3.5 h-3.5" />
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--success)]/15 text-[color:var(--success)] border border-[color:var(--success)]/40 shadow-[0_0_18px_-4px_color-mix(in_oklab,var(--success)_55%,transparent)]">
              <Sparkle className="w-3 h-3" /> New
            </span>
          )}
          {isMixer ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--copper)]/15 text-[color:var(--copper)] border border-[color:var(--copper)]/40">
              <Sparkles className="w-3 h-3" /> Mixer
            </span>
          ) : idea.featured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--copper)]/12 text-[color:var(--copper)] border border-[color:var(--copper)]/35">
              <Flame className="w-3 h-3" /> Featured
            </span>
          ) : null}
          <button
            onClick={() => onToggleBookmark?.(idea.id)}
            aria-label={bookmarked ? "Remove bookmark" : "Save formula"}
            className={`w-8 h-8 inline-flex items-center justify-center rounded-full transition-colors ${
              bookmarked
                ? "bg-[color:var(--copper)]/20 text-[color:var(--copper)]"
                : "text-muted-foreground hover:text-[color:var(--copper)] hover:bg-[color:var(--secondary)]/70"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Formula with inline editable slots */}
      <h3
        className="text-[1.4rem] md:text-2xl leading-[1.2] font-bold tracking-tight relative"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {slots.map((s) => {
          if (s.kind === "text") return <span key={s.key}>{s.value}</span>;
          const v = values[s.key] ?? "";
          const display = v || s.placeholder;
          return (
            <span key={s.key} className="inline-flex items-baseline relative">
              <span aria-hidden className="invisible whitespace-pre px-1.5">
                {display}
              </span>
              <input
                value={v}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                }
                placeholder={s.placeholder}
                aria-label={s.placeholder}
                className="absolute inset-0 w-full bg-[color:var(--copper)]/10 border border-dashed border-[color:var(--copper)]/45 rounded-md px-1.5 text-[color:var(--copper)] font-bold focus:outline-none focus:border-[color:var(--copper)] focus:bg-[color:var(--copper)]/15 placeholder:text-[color:var(--copper)]/70 transition-colors"
                style={{
                  textShadow:
                    "0 0 18px color-mix(in oklab, var(--copper) 40%, transparent)",
                }}
              />
            </span>
          );
        })}
      </h3>

      {/* Expander */}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
          View Script Hook & Outline
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

              <div className="mt-4 rounded-lg p-3 bg-[color:var(--destructive)]/8 border border-[color:var(--destructive)]/35 flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-[color:var(--destructive)] shrink-0" />
                <p className="text-[12.5px] leading-snug text-foreground/85">
                  <span className="text-[color:var(--destructive)] font-bold uppercase tracking-wider text-[10px] mr-1">
                    Anti-hook
                  </span>
                  {idea.antiHook}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--teal)] font-semibold mb-2">
                  3-Bullet Pacing Outline
                </p>
                <ol className="space-y-1.5 text-[13.5px] text-foreground/85">
                  {idea.outline.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[color:var(--copper)] font-bold">
                        {i + 1}.
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 relative">
        <CopyBtn
          label="Copy Formula"
          active={copied === "formula"}
          onClick={() => copy("formula", buildFilled(idea.formula, values))}
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
