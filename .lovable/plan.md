## What to add (feature ideas)

Picked to fit the existing dark/copper/teal aesthetic and the localStorage-only constraint — no backend, no new deps.

1. **Export & Backup**
   - "Export My Stuff" button: downloads a single JSON with bookmarks, history, pipeline, streak, copy counts, daily challenge log.
   - "Import" pastes JSON back. Useful since everything lives in localStorage and users will lose it on cache clear.

2. **Hook Score Live Meter** (on focused cards)
   - As the user fills brackets, live-score the filled title against simple heuristics already present (curiosity/novelty/authority words, length, numbers, brackets-of-specificity) and show a 0–100 bar with a one-line tip ("Add a number", "Cut 12 chars for TikTok").

3. **A/B Variant Generator**
   - Button on a filled card → generates 3 swap variants by substituting synonyms/intensifiers from a tiny local wordbank (`Stop / Quit / Kill`, `secret / system / method`). Pure client, deterministic.

4. **Niche-aware Wordbank Suggestions**
   - Each `[bracket]` shows a tiny ▾ chip with 5 niche-appropriate suggestions (Tech AI gets "Notion, Cursor, Claude…", Finance gets "$10k, S&P, Roth…"). Click to fill. Reuses existing VAR_BANK pattern.

5. **Weekly Recap modal**
   - Once per week (Sunday), modal: "You copied 14 formulas, finished 5 challenges, kept a 6-day streak." Share-as-image (canvas) or share-as-text. Drives retention.

6. **Keyboard shortcuts**
   - `/` focus search, `s` shuffle, `g` slot machine, `?` cheat-sheet modal. Power-user feel.

7. **Niche deep-link routes** (SEO win)
   - `/tech-ai`, `/finance`, `/fitness` etc. as real routes (not just tabs) with unique `head()` titles + descriptions. Each shareable, indexable.

## Performance improvements

Observable issues from reading the code:

1. **`src/routes/index.tsx` is 1,741 lines in a single file**
   - Split `DailyChallengeCard`, `QuickStatsBar`, `StreakBadge`, `TabPill`, `HistoryPanel`, `PipelinePanel`, Slot Machine modal, Remix Lab modal, Focus modal into `src/components/*` files.
   - Big win: code-splitting by TanStack auto-splitter only kicks in across route boundaries; large component file = large initial JS chunk. Splitting also unblocks `React.lazy` for the heavy modals (Slot Machine, Remix, Focus) so they only download when opened.

2. **`IdeaCard` re-renders 12× per shuffle and does expensive work each time**
   - `handleMove` updates 4 motion values on every `mousemove` — fine, but the two stacked `radial-gradient` glow divs each compute a new `background` string per render via `glowX.get()` (line 222). One of them isn't even using motion values reactively. Drop the duplicate, keep the `useTransform`-driven one.
   - Wrap `IdeaCard` in `React.memo` with a custom equality (idea.id, bookmarked, isNew, remixSelected, forceOpen). Right now every parent re-render (e.g. typing in another card) re-renders all 12 cards.
   - `useEffect(() => onValuesChange?.(values), [values, onValuesChange])` fires on every keystroke and bubbles to parent — fine for the hero card, but it's wired on every card. Gate it behind `if (!onValuesChange) return`.

3. **Google Fonts blocking render**
   - Currently loaded via `<link rel="stylesheet">` in route head with 4 families × multiple weights. Drop unused weights, and prefer `&display=swap` (already there) + `rel="preload" as="style"` + self-host with `fontsource` if we want zero render-blocking. Quick win: trim to the weights actually used.

4. **`filtered` reshuffles 12-card grid on every keystroke**
   - The Fisher-Yates inside the `useMemo` is fine, but `query` is in the dep list with no debounce — every keystroke triggers full filter + shuffle + re-mount of 12 motion cards with stagger animation. Add a 120 ms debounce on `query`.

5. **`getNewBadgeIds` runs `Math.random()` over `ALL_IDEAS` on mount**
   - Cheap, but it sets state in an effect causing a second render of the full grid. Compute it lazily in `useState(() => …)` instead.

6. **Heavy framer-motion usage on tabs / pills**
   - `TabPill` likely uses `motion.button` with layout animations; with ~10 pills, layout animations on each tab change are costly. Use plain `<button>` + CSS transitions for pills, keep framer-motion for cards and modals only.

7. **Image / asset audit**
   - Confirm there are no large hero images. If any decorative SVGs were inlined, externalize and lazy-load below the fold.

8. **Route-level**
   - `defaultPreloadStaleTime: 0` in router.tsx — fine for now (no loaders), leave it.

## Suggested execution order

If you approve, I'd do this in three small passes:

- **Pass A (perf, invisible):** memoize `IdeaCard`, dedupe glow div, lazy-load Slot/Remix/Focus modals, debounce search, lazy-init `newIds`, trim font weights.
- **Pass B (features, small):** Export/Import JSON, keyboard shortcuts, niche-aware bracket suggestions.
- **Pass C (features, bigger):** Hook Score live meter + A/B variant generator + Weekly Recap.

Tell me which features (1–7) you want and whether to start with Pass A.