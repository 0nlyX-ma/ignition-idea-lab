import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  Share2,
  Activity,
  Expand,
  Plus,
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

export const ATTRIBUTION = "\n\n⚡ Generated with Creator Engine | creator-engine.app";

export function parseSlots(formula: string) {
  const parts = formula.split(/(\[[^\]]+\])/g);
  return parts.map((p, i) => {
    if (p.startsWith("[") && p.endsWith("]")) {
      return { kind: "slot" as const, placeholder: p.slice(1, -1), key: i };
    }
    return { kind: "text" as const, value: p, key: i };
  });
}

export function buildFilled(formula: string, values: Record<number, string>) {
  const slots = parseSlots(formula);
  return slots
    .map((s) => {
      if (s.kind === "text") return s.value;
      const v = values[s.key]?.trim();
      return v || `[${s.placeholder}]`;
    })
    .join("");
}

export function IdeaCard({
  idea,
  index = 0,
  variant = "default",
  isNew = false,
  bookmarked = false,
  onToggleBookmark,
  onCopy,
  hero = false,
  layoutId,
  initialValues,
  onValuesChange,
  onShare,
  onLogHistory,
  remixActive = false,
  remixSelected = false,
  onRemixSelect,
  onExpand,
  forceOpen = false,
  onAddToPipeline,
}: {
  idea: Idea;
  index?: number;
  variant?: "default" | "mixer" | "remix";
  isNew?: boolean;
  bookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onCopy?: (id: string) => void;
  hero?: boolean;
  layoutId?: string;
  initialValues?: Record<number, string>;
  onValuesChange?: (values: Record<number, string>) => void;
  onShare?: (id: string, values: Record<number, string>) => void;
  onLogHistory?: (text: string) => void;
  remixActive?: boolean;
  remixSelected?: boolean;
  onRemixSelect?: (id: string) => void;
  onExpand?: (id: string) => void;
  forceOpen?: boolean;
  onAddToPipeline?: (text: string, niche: string) => void;
}) {
  const [open, setOpen] = useState(forceOpen || hero);
  const [tipOpen, setTipOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [copied, setCopied] = useState<"formula" | "hook" | "share" | null>(null);
  const [pulse, setPulse] = useState(false);
  const [values, setValues] = useState<Record<number, string>>(initialValues ?? {});
  const [previewLen, setPreviewLen] = useState<number | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Magnetic tilt
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const mxv = useMotionValue(50);
  const myv = useMotionValue(50);
  const sRx = useSpring(rx, { stiffness: 220, damping: 18, mass: 0.4 });
  const sRy = useSpring(ry, { stiffness: 220, damping: 18, mass: 0.4 });
  const glowX = useTransform(mxv, (v) => `${v}%`);
  const glowY = useTransform(myv, (v) => `${v}%`);

  const slots = useMemo(() => parseSlots(idea.formula), [idea.formula]);

  useEffect(() => {
    if (!onValuesChange) return;
    onValuesChange(values);
  }, [values, onValuesChange]);

  useEffect(() => {
    if (hero && firstInputRef.current) {
      const t = setTimeout(() => firstInputRef.current?.focus({ preventScroll: true }), 600);
      return () => clearTimeout(t);
    }
  }, [hero]);

  const handleMove = (e: React.MouseEvent) => {
    if (hero) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const max = 4.5;
    ry.set((px - 0.5) * (max * 2));
    rx.set(-(py - 0.5) * (max * 2));
    mxv.set(px * 100);
    myv.set(py * 100);
  };
  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
    mxv.set(50);
    myv.set(50);
  };

  const copy = async (kind: "formula" | "hook" | "share", text: string) => {
    try {
      await navigator.clipboard.writeText(text + ATTRIBUTION);
      setCopied(kind);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      onCopy?.(idea.id);
      if (kind === "formula") {
        const hasFilled = Object.values(values).some((v) => v && v.trim());
        onLogHistory?.(text);
        setPreviewLen(hasFilled ? text.length : null);
      }
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  const isMixer = variant === "mixer";
  const isRemix = variant === "remix";
  const accent = isMixer || isRemix ? "var(--copper)" : "var(--teal)";
  const glowBg = useTransform(
    [glowX, glowY] as never,
    ([x, y]: string[]) =>
      `radial-gradient(420px circle at ${x} ${y}, color-mix(in oklab, ${accent} 26%, transparent), transparent 65%)`,
  );

  const handleCardClick = () => {
    if (remixActive) {
      onRemixSelect?.(idea.id);
    }
  };

  return (
    <motion.article
      ref={cardRef}
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{
        duration: 0.55,
        delay: hero ? 0 : index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleCardClick}
      style={{
        rotateX: hero ? 0 : sRx,
        rotateY: hero ? 0 : sRy,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={`${isMixer || isRemix ? "card-mixer" : "card-brushed"} rounded-2xl ${
        hero ? "p-7 sm:p-9" : "p-6"
      } flex flex-col gap-5 relative overflow-hidden group transition-shadow duration-300 ${
        remixSelected
          ? "ring-2 ring-[color:var(--copper)] shadow-[0_0_40px_-4px_color-mix(in_oklab,var(--copper)_60%,transparent)]"
          : "hover:shadow-[0_24px_70px_-22px_color-mix(in_oklab,var(--copper)_50%,transparent)]"
      } ${remixActive ? "cursor-pointer" : ""}`}
    >
      {/* Cursor-follow glow (single reactive layer) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{ background: glowBg }}
      />

      {/* TOP ROW */}
      <div className="flex items-start justify-between relative gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap relative">
          {/* DNA Score */}
          <button
            onClick={(e) => { e.stopPropagation(); setScoreOpen((o) => !o); }}
            onMouseEnter={() => setScoreOpen(true)}
            onMouseLeave={() => setScoreOpen(false)}
            className={`score-glow inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--secondary)]/60 border ${
              isMixer || isRemix ? "border-[color:var(--copper)]/50" : "border-[color:var(--teal)]/40"
            }`}
            aria-label="View DNA breakdown"
          >
            <Activity
              className={`w-3 h-3 ${
                isMixer || isRemix ? "text-[color:var(--copper)]" : "text-[color:var(--teal)]"
              }`}
            />
            <span
              className={`text-xs font-semibold tracking-wide font-display ${
                isMixer || isRemix ? "text-[color:var(--copper)]" : "text-[color:var(--teal)]"
              }`}
            >
              DNA {idea.score.toFixed(1)}
            </span>
          </button>
          <AnimatePresence>
            {scoreOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute z-30 left-0 top-full mt-2 w-72 p-4 rounded-xl glass shadow-2xl"
              >
                <span className="block text-[10px] uppercase tracking-[0.16em] text-[color:var(--copper)] font-bold mb-2.5">
                  Pattern DNA
                </span>
                <DnaBar label="Curiosity" value={idea.psyScores.curiosity} />
                <DnaBar label="Novelty" value={idea.psyScores.novelty} />
                <DnaBar label="Authority" value={idea.psyScores.authority} />
                <p className="mt-3 pt-2.5 border-t border-[color:var(--copper)]/15 text-[11.5px] leading-snug text-foreground/75">
                  {idea.psychology}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <button
            onMouseEnter={() => setTipOpen(true)}
            onMouseLeave={() => setTipOpen(false)}
            onClick={(e) => { e.stopPropagation(); setTipOpen((o) => !o); }}
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
          {hero && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[color:var(--copper)]/15 text-[color:var(--copper)] border border-[color:var(--copper)]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--copper)] pulse-dot" />
              Your Next Viral Idea
            </span>
          )}
          {isNew && !hero && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--success)]/15 text-[color:var(--success)] border border-[color:var(--success)]/40">
              <Sparkle className="w-3 h-3" /> New
            </span>
          )}
          {isRemix ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--copper)]/20 text-[color:var(--copper)] border border-[color:var(--copper)]/50">
              <Sparkles className="w-3 h-3" /> Remix
            </span>
          ) : isMixer ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--copper)]/15 text-[color:var(--copper)] border border-[color:var(--copper)]/40">
              <Sparkles className="w-3 h-3" /> Mixer
            </span>
          ) : idea.featured && !hero ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[color:var(--copper)]/12 text-[color:var(--copper)] border border-[color:var(--copper)]/35">
              <Flame className="w-3 h-3" /> Featured
            </span>
          ) : null}
          {!hero && onExpand && !forceOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); if (!remixActive) onExpand(idea.id); }}
              aria-label="Enter focus mode"
              title="Focus mode"
              className="w-8 h-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-[color:var(--teal)] hover:bg-[color:var(--secondary)]/70 transition-colors"
            >
              <Expand className="w-4 h-4" />
            </button>
          )}
          {!hero && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(idea.id); }}
              aria-label={bookmarked ? "Remove bookmark" : "Save formula"}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-full transition-colors ${
                bookmarked
                  ? "bg-[color:var(--copper)]/20 text-[color:var(--copper)]"
                  : "text-muted-foreground hover:text-[color:var(--copper)] hover:bg-[color:var(--secondary)]/70"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
            </button>
          )}
          {!hero && onAddToPipeline && (
            <PipelineAddBtn
              onAdd={() => onAddToPipeline(buildFilled(idea.formula, values), idea.niche)}
            />
          )}
        </div>
      </div>

      {/* Formula */}
      <h3
        onDoubleClick={() => !remixActive && onExpand?.(idea.id)}
        className={`${hero ? "text-3xl sm:text-5xl md:text-6xl" : "text-[1.4rem] md:text-2xl"} leading-[1.15] font-bold tracking-tight relative`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {slots.map((s, idx) => {
          if (s.kind === "text") return <span key={s.key}>{s.value}</span>;
          const v = values[s.key] ?? "";
          const display = v || s.placeholder;
          const isFirstSlot = idx === slots.findIndex((x) => x.kind === "slot");
          return (
            <span key={s.key} className="inline-flex items-baseline relative">
              <span aria-hidden className="invisible whitespace-pre px-1.5 font-mono">
                {display}
              </span>
              <input
                ref={hero && isFirstSlot ? firstInputRef : undefined}
                value={v}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                }
                placeholder={s.placeholder}
                aria-label={s.placeholder}
                spellCheck={false}
                className={`absolute inset-0 w-full bg-[color:var(--copper)]/10 border border-dashed border-[color:var(--copper)]/45 rounded-md px-1.5 text-[color:var(--copper)] font-bold focus:outline-none focus:border-[color:var(--copper)] focus:bg-[color:var(--copper)]/15 placeholder:text-[color:var(--copper)]/70 transition-colors font-mono ${
                  hero && isFirstSlot && !v ? "blink-caret" : ""
                }`}
                style={{
                  textShadow: "0 0 18px color-mix(in oklab, var(--copper) 40%, transparent)",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </span>
          );
        })}
      </h3>

      {/* Expander */}
      {!hero && (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
            View Script Hook & Outline
          </button>
        </div>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={hero ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className={`${hero ? "text-base sm:text-lg" : "text-[15px]"} leading-relaxed text-foreground/90 border-l-2 border-[color:var(--copper)]/60 pl-4 italic`}>
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
                    <span className="text-[color:var(--copper)] font-bold">{i + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2 pt-1 relative">
        <CopyBtn
          label="Copy Formula"
          active={copied === "formula"}
          pulse={pulse && copied === "formula"}
          onClick={(e) => { e.stopPropagation(); copy("formula", buildFilled(idea.formula, values)); }}
          variant="primary"
        />
        <CopyBtn
          label="Copy Hook"
          active={copied === "hook"}
          pulse={pulse && copied === "hook"}
          onClick={(e) => { e.stopPropagation(); copy("hook", idea.hook); }}
          variant="ghost"
        />
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(idea.id, values);
              setCopied("share");
              setTimeout(() => setCopied(null), 1500);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-[color:var(--secondary)]/70 text-foreground/90 hover:bg-[color:var(--secondary)] border border-[color:var(--copper)]/15 transition-all active:scale-[0.97]"
            aria-label="Share filled formula"
          >
            {copied === "share" ? (
              <>
                <Check className="w-4 h-4 text-[color:var(--success)]" />
                Link copied
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {previewLen !== null && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <PlatformPreview length={previewLen} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function PlatformPreview({ length }: { length: number }) {
  let label: string;
  let color: string;
  let dot: string;
  if (length < 60) {
    label = "✓ YouTube safe";
    color = "var(--teal)";
    dot = "var(--teal)";
  } else if (length <= 100) {
    label = "⚠ May truncate in feed";
    color = "var(--copper)";
    dot = "var(--copper)";
  } else {
    label = "✗ Too long for most platforms";
    color = "var(--destructive)";
    dot = "var(--destructive)";
  }
  return (
    <div
      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold"
      style={{
        background: `color-mix(in oklab, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
        color: color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      <span>{label}</span>
      <span className="font-mono opacity-70" style={{ fontFamily: "var(--font-mono)" }}>
        {length} chars
      </span>
    </div>
  );
}

function DnaBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-foreground/80 font-medium">{label}</span>
        <span className="font-mono text-[color:var(--copper)] font-bold" style={{ fontFamily: "var(--font-mono)" }}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[color:var(--secondary)]/70 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--teal), var(--copper))",
            boxShadow: "0 0 10px color-mix(in oklab, var(--copper) 60%, transparent)",
          }}
        />
      </div>
    </div>
  );
}

function CopyBtn({
  label,
  active,
  pulse,
  onClick,
  variant,
}: {
  label: string;
  active: boolean;
  pulse?: boolean;
  onClick: (e: React.MouseEvent) => void;
  variant: "primary" | "ghost";
}) {
  const base =
    "relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] overflow-hidden";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-[color:var(--copper)] to-[color:var(--teal)] text-[color:var(--background)] hover:brightness-110 shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--copper)_50%,transparent)]"
      : "bg-[color:var(--secondary)]/70 text-foreground/90 hover:bg-[color:var(--secondary)] border border-[color:var(--copper)]/15";
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      <AnimatePresence>
        {pulse && (
          <motion.span
            key="pulse"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, white 50%, transparent) 0%, transparent 65%)",
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <motion.span
            key="ok"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="inline-flex items-center gap-2 relative"
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
            className="inline-flex items-center gap-2 relative"
          >
            <Copy className="w-4 h-4" />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function PipelineAddBtn({ onAdd }: { onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
      aria-label="Add to pipeline"
      title="Add to pipeline"
      className={`w-8 h-8 inline-flex items-center justify-center rounded-full transition-colors ${
        added
          ? "bg-[color:var(--teal)]/20 text-[color:var(--teal)]"
          : "text-muted-foreground hover:text-[color:var(--teal)] hover:bg-[color:var(--secondary)]/70"
      }`}
    >
      {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
    </button>
  );
}
