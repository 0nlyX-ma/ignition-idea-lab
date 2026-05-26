import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, ChevronDown, Sparkles } from "lucide-react";
import type { Idea } from "@/lib/ideas";

function highlightBrackets(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((p, i) =>
    p.startsWith("[") && p.endsWith("]") ? (
      <span
        key={i}
        className="text-[color:var(--mint-glow)] font-semibold"
        style={{ textShadow: "0 0 18px color-mix(in oklab, var(--mint-glow) 50%, transparent)" }}
      >
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function IdeaCard({ idea, index }: { idea: Idea; index: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"formula" | "hook" | null>(null);

  const copy = async (kind: "formula" | "hook", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1400);
    } catch {}
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden group"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px circle at 50% -20%, color-mix(in oklab, var(--indigo-glow) 18%, transparent), transparent 60%)",
        }}
      />

      <div className="flex items-center justify-between relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--secondary)]/60 border border-[color:var(--mint-glow)]/30">
          <span className="w-2 h-2 rounded-full bg-[color:var(--mint-glow)] pulse-dot" />
          <span className="text-xs font-semibold tracking-wide text-[color:var(--mint-glow)]">
            {idea.score.toFixed(1)}% Score
          </span>
        </div>
        <Sparkles className="w-4 h-4 text-muted-foreground/50" />
      </div>

      <h3 className="text-xl md:text-[1.35rem] leading-snug font-semibold tracking-tight relative">
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
              <p className="mt-3 text-sm leading-relaxed text-foreground/85 border-l-2 border-[color:var(--indigo-glow)]/60 pl-4 italic">
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
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97]";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-[color:var(--indigo-glow)] to-[color:var(--mint-glow)] text-[color:var(--background)] hover:brightness-110"
      : "bg-[color:var(--secondary)]/70 text-foreground/90 hover:bg-[color:var(--secondary)] border border-white/5";
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
