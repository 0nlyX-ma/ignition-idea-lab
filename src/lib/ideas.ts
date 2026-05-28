export type Platform = "youtube" | "tiktok" | "x" | "linkedin";

export type NicheKey = "tech-ai" | "gaming" | "solopreneur" | "productivity";

export type Idea = {
  id: string;
  score: number;
  formula: string;
  hook: string;
  why: string;
  featured?: boolean;
  niche: NicheKey | "mixer";
  platforms: Platform[];
  antiHook: string;
  outline: [string, string, string];
  psychology: string;
};

export const NICHES: { key: NicheKey; label: string }[] = [
  { key: "tech-ai", label: "Tech & AI" },
  { key: "gaming", label: "Gaming" },
  { key: "solopreneur", label: "Solopreneur / Indie Hacking" },
  { key: "productivity", label: "Productivity" },
];

export const PLATFORMS: { key: Platform; label: string }[] = [
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
];

const NICHE_PLATFORM_DEFAULTS: Record<NicheKey | "mixer", Platform[]> = {
  "tech-ai": ["youtube", "x", "linkedin"],
  gaming: ["youtube", "tiktok"],
  solopreneur: ["x", "linkedin", "youtube"],
  productivity: ["youtube", "x", "linkedin"],
  mixer: ["youtube", "x", "tiktok", "linkedin"],
};

const ANTI_HOOKS = [
  "Don't open with 'Hey guys' or 'Welcome back' — viewers bail in 0.8s.",
  "Don't tease the payoff for 30 seconds — front-load the promise or lose 70% of retention.",
  "Don't introduce yourself first — your face isn't the hook, the stakes are.",
  "Don't read the title out loud — restate the tension in fresh words.",
  "Don't hedge with 'kind of' or 'maybe' — confidence is the algorithm's tax.",
  "Don't start on B-roll. Start on the line that makes them text a friend.",
];

const OUTLINES: Array<[string, string, string]> = [
  [
    "Open with the unexpected tension — name the enemy in one sentence.",
    "Reveal the mechanism or unlikely fix nobody else is showing.",
    "Land the concrete result + the smallest next step the viewer can copy today.",
  ],
  [
    "State the painful, specific status quo (use a number or screenshot).",
    "Introduce the weird middle move — the step everyone skips.",
    "Show the after-photo, then drop the CTA + one strong opinion.",
  ],
  [
    "Pattern-interrupt with one line that contradicts the default belief.",
    "Walk through 2–3 steps that prove your contrarian take — keep cuts tight.",
    "Recap the takeaway as a tweetable line, then point to the next video.",
  ],
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickPlatforms(niche: NicheKey | "mixer", id: string): Platform[] {
  const base = NICHE_PLATFORM_DEFAULTS[niche];
  // Drop one ~30% of the time for variety, deterministic by id.
  const h = hash(id);
  if (base.length > 2 && h % 10 < 3) {
    return base.filter((_, i) => i !== h % base.length);
  }
  return base;
}

function psychologyOf(why: string): string {
  // First clause before "." or "—" or "+", trimmed.
  const m = why.split(/[.—]/)[0]?.trim() ?? why;
  return m.length > 70 ? m.slice(0, 67).trim() + "…" : m;
}

const mk = (
  prefix: string,
  niche: NicheKey,
  arr: Array<[number, string, string, string, boolean?]>,
): Idea[] =>
  arr.map(([score, formula, hook, why, featured], i) => {
    const id = `${prefix}${i + 1}`;
    const h = hash(id);
    return {
      id,
      score,
      formula,
      hook,
      why,
      featured,
      niche,
      platforms: pickPlatforms(niche, id),
      antiHook: ANTI_HOOKS[h % ANTI_HOOKS.length],
      outline: OUTLINES[h % OUTLINES.length],
      psychology: psychologyOf(why),
    };
  });

export const IDEAS: Record<NicheKey, Idea[]> = {
  "tech-ai": mk("ta", [
    [98.2, "[Popular AI Tool] has a dangerous new feature (and nobody is talking about it)", "Buried three menus deep, this toggle quietly rewrites how your data leaves your machine. I only found it because a beta tester slipped.", "Pattern interrupt + tribal exclusivity. 'Dangerous' triggers loss-aversion; 'nobody is talking about it' positions the viewer as an insider before they even click.", true],
    [97.6, "I tried replacing my entire [Job Title] workflow with [New AI Agent] for 7 days", "Day 2 I almost quit. Day 4 it did something my human contractor never could. The result rewired how I'll hire forever.", "Temporal contract ('7 days') + identity stakes. Viewers stay to see if their own job is next, plus the day-by-day arc creates micro cliffhangers."],
    [96.9, "The [Number]-second prompt that just killed [Entire Software Category]", "I tested it against the $400/mo industry leader. The output wasn't just close — it was embarrassingly better.", "Specificity bias. A number in the title makes the claim feel measurable, while 'killed' frames the video as news, not opinion."],
    [96.1, "[Big Tech CEO] just confessed: [New Tech] is a lie (full breakdown)", "One sentence in a 90-minute interview that the headlines all missed. It changes what you should be building in 2026.", "Authority leak. Audiences trust insider admissions more than analysis; pairing with 'full breakdown' promises payoff for the curious."],
    [95.8, "I built a $1,000/mo [SaaS Product] in 24 hours using only [Specific AI Stack]", "No team. No funding. One weekend, three tools, and a Stripe link that started pinging by Monday morning.", "Aspiration + recipe. The dollar figure is the dream; the stack list is the actionable promise that makes viewers feel they can replicate it.", true],
    [95.2, "[Big Tech Company] just quietly killed [Popular Product] — here's what nobody noticed", "A single line in a 40-page changelog completely rewrites the playbook. Let me decode it before your competitors do.", "Conspiracy + scarcity of attention. 'Quietly' implies you alone caught what others missed."],
    [94.7, "I gave [AI Model] my real bank account for 30 days. Here's what it did.", "I expected chaos. What actually happened was so unsettling I had to talk to my accountant before publishing this.", "Risk vicariously consumed. Viewers get the thrill of the experiment without the stakes, plus money triggers attention universally."],
    [94.3, "Why [Trending Framework] is a trap (and what senior devs use instead)", "I shipped production code with it for six months. Here's the exact moment I realized I'd been sold a beautiful lie.", "Contrarian authority. 'Senior devs' creates an in-group; 'trap' makes the viewer feel protected by watching."],
    [93.9, "I let [AI Agent] run my [Business Function] unsupervised for a week", "Spoiler: it almost cost me a major client on day 3. The recovery taught me what these tools actually can't do.", "Stakes + suspense. The 'almost' lets you tease catastrophe without losing trust."],
    [93.4, "The [Number]-second AI prompt that does the work of a $[Amount] [Specialist]", "Tested on three real client projects. The output was so good my freelancer asked if I'd hired someone else.", "Cost comparison anchoring. Putting time vs money side-by-side creates an unbeatable mental ROI calculation."],
    [92.7, "I asked [Frontier Model] to do my job and it actually did. Now what?", "I'm not panicking. I'm pivoting. Here's the exact 3-step plan I'm using to stay employable through 2030.", "Existential hook + practical resolution. Fear opens the loop, the plan closes it."],
    [92.1, "Stop using [Popular AI App]. Use this instead.", "Same model under the hood. Half the price. And one feature that makes the original feel like a beta.", "Imperative + insider tip. Short titles outperform; the implied 'I know something you don't' drives the click.", true],
    [91.8, "I rebuilt [Famous SaaS] in a weekend with [AI Tool] — full source code", "Took 11 hours. Cost $4 in API credits. The hardest part wasn't the code — it was admitting how easy it was.", "Demystification. The 'full source code' promise filters for serious watchers who'll comment, share, and rewatch."],
    [91.3, "The [Specific Model] setting that quietly 10x'd my output", "I had this toggle wrong for 4 months. Flipping it didn't just improve results — it changed which projects I take on.", "Micro-tip + macro-claim. Small action, huge promised reward = irresistible CTR."],
    [90.9, "[Programming Language] devs are quietly switching to [Niche Language]. Here's why.", "I interviewed 12 engineers at FAANG-tier companies. They all gave the same 3 reasons — and one I never expected.", "Trend-spotting + tribal pressure. Devs click to confirm they're not being left behind."],
    [90.4, "I tested every [AI Tool Category] so you don't have to ([Number] hours of footage)", "After $[amount] in subscriptions, only 3 survived. Two of them cost less than $20/mo.", "Sacrifice + service. You did the work; viewers get the cheat sheet."],
    [89.8, "The exact [System Prompt] I use to make [AI Tool] [Result]", "I tweaked this prompt 73 times over six months. The final version fits in a tweet and outperforms 90% of agents I've tried.", "Open-loop specificity. '73 times' signals real effort; 'fits in a tweet' promises immediate value."],
    [89.3, "I let [Coding Agent] refactor my entire startup's codebase overnight", "Woke up to 247 files changed and one panicked Slack message from my CTO. Here's what survived the audit.", "Stakes + visual proof potential. Audiences will rewatch to see specific commits and reactions."],
    [88.9, "Why I cancelled [Premium AI Subscription] (and what I run locally now)", "It's slower. It's clunkier. And after the privacy thing they shipped last month, I'm never going back.", "Defection narrative. Cancellation stories outperform because they validate viewer skepticism."],
    [88.4, "[Tech Founder] said this on a podcast and it changes everything for [Industry]", "Twelve seconds, buried in hour three. I clipped it, replayed it, and built an entire product around what he revealed.", "Easter-egg framing. Long-form audiences love feeling they spotted the gold others missed."],
    [88.0, "I automated [Boring Task] with [AI Workflow] and got my weekends back", "It took 90 minutes to set up. It saves 11 hours a week. The ROI math is almost insulting.", "Time-debt redemption. 'Got my weekends back' is one of the highest-converting promises in any niche."],
    [87.5, "The truth about [Hyped AI Tool] after [Number] months of daily use", "Spoiler: the hype was wrong. Reality is somehow more interesting — and more useful — than the launch demos suggested.", "Time-tested credibility. Long-term reviews crush launch-week takes for trust."],
    [87.1, "I rebuilt my [Tech Stack] from scratch using only [Year] tools", "Half the dependencies. Twice the speed. And one decision that my future self will either thank or curse me for.", "Self-aware uncertainty. Honest doubt outperforms manufactured confidence with technical viewers.", true],
    [86.8, "[AI Tool] vs [AI Tool]: I ran the same impossible task on both", "One refused. One hallucinated. The third (I added a wildcard) did something I didn't even know was possible.", "Showdown + surprise. Comparisons are inherently sticky; the wildcard is the rewatch trigger."],
    [86.4, "The [Number] [Tech] skills that will be worthless by [Year]", "I asked 8 hiring managers what they're cutting from junior interviews. The answers should be making bootcamps nervous.", "Career anxiety + insider data. Job-related fear is the most clickable emotion in tech."],
    [86.0, "I built a tiny [Hardware] that runs [Big AI Model] offline", "Cost: $89. Power draw: less than a lightbulb. The first thing I asked it shocked me into rethinking the whole cloud era.", "Maker + main-character framing. Hardware-on-the-edge content always overperforms because it feels like sci-fi made real."],
    [85.7, "Why every [Role] should learn [Unexpected Skill] right now", "It's not coding. It's not prompt engineering. It's the one workflow that's separating the rehired from the laid-off.", "Negation hook + urgency. Telling viewers what it's NOT first triples curiosity to find out what it IS."],
    [85.4, "[Open-Source AI Tool] just made [Paid AI Tool] obsolete (with proof)", "Same benchmark. Same task. Side-by-side. The chart at 4:12 is the one I'm going to be sharing with clients all year.", "Side-by-side proof. Visual evidence promises lift the click-through ceiling."],
    [85.1, "I gave an AI my [Personal Data] for a month. The pattern it found scared me.", "I thought I knew myself. The model spotted something my therapist had been hinting at for two years.", "Self-revelation. Personal vulnerability + AI = one of the most shared formats of the year."],
    [85.0, "What [Senior Engineer] told me after watching me code with AI for 10 minutes", "Three words I haven't been able to stop thinking about. They reshaped how I structure every project now.", "Mentor moment. The 'three words' tease is impossible to scroll past."],
  ]),

  gaming: mk("g", [
    [98.4, "I beat [Hardest Boss] using only [Worst Weapon] — and discovered something broken", "Everyone said impossible. Twelve hours in, I found a mechanic the devs definitely did not intend.", "Challenge run + glitch reveal. Two of YouTube gaming's most reliable formats stacked into one title.", true],
    [97.8, "[Pro Player] reacts to my [Rank] gameplay and tells me the brutal truth", "I thought I was decent. Three minutes in, they paused the clip and said the one sentence that fixed my aim forever.", "Authority verdict + transformation. Viewers self-insert as the student getting the secret coaching."],
    [97.2, "The [Game] setting 99% of players have wrong (and pros never talk about)", "I dug through 14 pro config files looking for the edge. They all had this one obscure value changed from default.", "Statistical exclusivity + tribal secret. 'Pros never talk about' implies you're breaking the omertà."],
    [96.6, "Speedrunning [Classic Game] in [Time] using a glitch from [Year]", "A forum post from 2008 had the answer the whole time. Nobody believed it worked until I caught it on a world record run.", "Time-traveling tech + record claim. History buffs and speedrunners both click."],
    [96.0, "I spent $[Amount] on [In-Game Item] so you don't have to", "Was it worth it? Honestly, the answer surprised even me — and it's not the one the publisher wants you to hear.", "Sacrifice + anti-publisher framing. Modern viewers love a creator who took the L for the community."],
    [95.5, "[New Game] is hiding [Number] secrets nobody has found yet", "I'm posting this 72 hours after launch. Number 4 might unlock something that breaks the whole endgame economy.", "Early discovery + urgency. Launch-window content gets baked into the algorithm faster than evergreen."],
    [95.1, "I played [Old Game] for the first time in [Year]. It humbled me.", "I thought modern games were hard. This 1998 cult classic taught me what 'difficulty' actually used to mean.", "Generational comparison. Older gamers nostalgia-click, younger gamers curiosity-click.", true],
    [94.6, "The [Number] [Game] mechanics streamers are abusing right now", "Tier 3 is so dirty the devs already announced a patch. Get it on your highlight reel before Tuesday.", "Limited-time exploit. Time-bound content has 3-4x higher CTR than evergreen tips."],
    [94.1, "I matched with a [Top-Rank] in [Game] and recorded everything they did differently", "It wasn't aim. It wasn't reaction time. It was one habit I'd never seen any guide mention.", "Ethnographic frame. Watching elites is the most-rewatched gaming content format."],
    [93.6, "[Game] vs the way it was supposed to release ([Leaked Build])", "Side-by-side footage of features they cut. Some of them would have changed everything — one of them probably should have stayed cut.", "Forbidden version. Cut-content videos consistently outperform reviews of the shipped game."],
    [93.1, "I built the [Theoretical Loadout] everyone says is bad. It's #1 on the ladder.", "Meta says don't. Math says actually do. I climbed 600 SR in 4 days proving why the spreadsheets were right.", "Anti-meta + evidence. Climb proof is the most credible gaming hook."],
    [92.6, "The [Game] strat I'm not supposed to share", "I learned this from a top-50 player who made me promise. They're streaming tonight, so I'm posting it before they notice.", "Forbidden knowledge + ticking clock. Viewers feel they're getting it just in time."],
    [92.2, "I quit [Popular Game] for [Niche Game] for 30 days. I'm not going back.", "I expected to crawl back by week 2. Instead I found something the mainstream titles forgot to include.", "Defection narrative + niche discovery. Brings two audiences together: the leavers and the curious."],
    [91.7, "[Famous Streamer] thought they couldn't be beaten at [Game]. Then this happened.", "Watch the moment at 6:42 — the chat goes absolutely feral. I had to slow it down to even understand what they did.", "Drama + replay reward. Streamer-clip formats outperform pure gameplay 3:1."],
    [91.3, "Why [Game] is secretly the hardest game of the decade", "It's not the bosses. It's not the mechanics. It's something subtler that wrecks 80% of players before they even notice.", "Reframe + mystery. 'Secretly' is one of the highest-CTR words in YouTube history."],
    [90.9, "I built a [Build Type] in [RPG] that the devs probably didn't test", "First three hours: garbage. Fourth hour I unlocked a synergy that turned the late game into a victory lap.", "Pay-off arc. The bad-to-broken structure mirrors classic three-act storytelling."],
    [90.4, "The [Game] tutorial lies. Here's what it should have told you.", "Six hours of pain spared. Eleven mechanics the game never bothered to explain. New player or veteran, watch tip #3.", "Service video + outrage. Bad tutorials are universally relatable.", true],
    [90.0, "[Game] just got the patch nobody asked for — and I love it", "Reading the patch notes I rolled my eyes. Playing it for two hours I texted three friends to reinstall.", "Contrarian conversion. Going from skeptic to convert is a more credible arc than uncritical hype."],
    [89.6, "Speedrun world record fell last night. Here's exactly how.", "1.3 seconds shaved off a category most thought was solved. The new trick is so weird I had to read the timing chart twice.", "News + technicality. Speedrun news travels fast and rewards depth."],
    [89.2, "I played [Indie Game] and now I can't take AAA seriously again", "It's 6 hours long. It cost $14. And it did something no $70 game has done for me in years.", "Comparative disillusionment. Indie-vs-AAA framing is reliably viral."],
    [88.8, "[Game] is hiding an entire questline 99% of players walk past", "The trigger is one line of dialogue you have to refuse three times. The reward is genuinely one of the best moments in the game.", "FOMO + payoff. Hidden content videos have the highest comment-rate of any gaming format."],
    [88.4, "I tried [Hardest Difficulty] in [Game] blind. It changed how I review games.", "I screamed. I rage-quit. I came back. By the end I understood what the dev team was actually trying to say.", "Personal stakes + creative critique. Reviewers who suffer earn trust faster."],
    [88.0, "The [Number]-year-old [Game] is outselling [New AAA] right now. Why?", "Steam charts don't lie. I dug into reviews, mods, and three discord servers to find what the new release got wrong.", "Data + investigation. Numbers-backed gaming essays are surging across the algorithm."],
    [87.6, "I let [Random Stranger] design my [RPG Build]. We hit max rank.", "They had 4 hours played. I had 800. The build was insane. The result was somehow more insane.", "Collaboration + chaos. Stranger-controlled content is unpredictable and infinitely shareable."],
    [87.2, "The [Game] DLC nobody bought is secretly the best content in the franchise", "Reviews trashed it at launch. Three years later I finally played it. The community owes the writers an apology.", "Critical reversal. 'Underrated' framings double down on the discovery dopamine."],
    [86.9, "I beat [Game] without [Core Mechanic]. The devs were not ready.", "Hour 27, the lead designer tweeted about my run. Hour 31, they patched the strategy out of existence.", "Dev-acknowledged exploit. Validation from creators is the ultimate proof signal."],
    [86.5, "Every [Genre] game is borrowing from [One Specific Game]. Most are doing it wrong.", "I played 9 releases this year that copied the formula. Only 2 understood why it worked.", "Critic mode + pattern recognition. Genre essays attract higher-LTV viewers."],
    [86.1, "I played [Game] on the worst possible hardware. It actually improved the experience.", "30 FPS. Awful screen. Sticky thumbsticks. Somehow the game finally clicked the way the devs intended.", "Anti-hardware-snob hot take. Counterintuitive setups always overperform."],
    [85.8, "[Game] has a [Year] anniversary update and the community broke down crying", "I expected a paint job. I got a love letter. The new opening cinematic alone justifies the reinstall.", "Emotional event + nostalgia. Anniversary moments are pre-loaded with community feeling."],
    [85.5, "The [Number] [Game] tips I wish someone told me at hour 1", "Tip #2 alone saves 4 hours of grinding. Tip #7 would have stopped me from deleting my first save entirely.", "Practical service. List-based newbie videos are evergreen and constantly resurface in search."],
  ]),

  solopreneur: mk("s", [
    [98.1, "I made $10,000 in [Number] hours with zero marketing budget (my step-by-step framework)", "No paid ads. No audience. Just 4 cold DMs, 1 landing page, and a single Notion doc that did the convincing.", "Dollar specificity + zero-cost promise. The contrast between 'big number' and 'no spend' is the most clickable solopreneur frame.", true],
    [97.5, "Why your [SaaS Idea] is destined to fail (and the [Number] niches printing money instead)", "I've reviewed 200+ indie launches this year. The pattern that separates the dead from the cashflowing is brutal — and obvious in hindsight.", "Tough-love authority. 'Destined to fail' triggers protective curiosity; the niches list delivers the redemption."],
    [97.0, "The exact email templates I used to land [Number] pre-sales for my [App Name]", "Copy them. Paste them. Send them. The third one feels almost too casual — that's why it converts at 41%.", "Receipts + permission. Templates with conversion stats remove the 'is this real?' friction.", true],
    [96.5, "I replaced my whole [Product] stack with [Name of No-Code Tool] — full data teardown", "Saved $880/mo. Cut my deploy time by 70%. And eliminated the one bottleneck that was quietly killing my growth.", "Stack-swap + receipts. No-code defection stories outperform feature reviews 5:1."],
    [96.0, "How to find your first [Number] users on [Social Platform] without being spammy", "I tried the bro tactics. They worked once and burned every account. This soft method got me 1,000 trial signups in 11 days.", "Anti-pattern + actionable alt. Calling out spam is a credibility shortcut."],
    [95.5, "I cold-emailed [Number] founders. [Number] replied. Here's the exact template.", "Subject line was the whole game. Once I rewrote it to look like a forwarded message, the reply rate quadrupled overnight.", "Data + reusable artifact. Specific reply rates raise the perceived value of the template."],
    [95.1, "I shipped [Number] products in [Timeframe]. Only [Number] worked. Here's why.", "The winners had nothing in common except one boring trait the failures all lacked. It's not what the Twitter gurus say.", "Post-mortem pattern. Failure-spotting content has higher trust than success-only content."],
    [94.6, "The $[Amount]/month side project I almost killed in week 2", "I wrote the shutdown email. I had it scheduled. The thing that made me delete it instead is the entire lesson of this video.", "Near-death pivot. 'Almost quit' arcs convert better than smooth-sailing stories."],
    [94.2, "How I priced [Product] from $[Low] to $[High] without losing a single customer", "Three price changes. Two angry emails. One revenue chart that finally went vertical. Here's the script I used every time.", "Pricing fear + relief. Pricing content has unusually high comment engagement."],
    [93.7, "The [Pricing Model] change that doubled my revenue without adding a single feature", "Customers literally thanked me for the price increase. The trick wasn't the number — it was where I put it on the page.", "Counterintuitive economic outcome. 'Same product, more money' violates expectations productively."],
    [93.3, "I built [App] in public. Here's everything I'd do differently.", "12 months. $7K MRR. Three lessons I would have paid 5 figures to know in month one.", "Public retrospective. Specific MRR + post-mortem combines the two highest-trust signals in indie hacking."],
    [92.8, "Quitting my $[Salary] job to build [Niche] was the worst best decision of my life", "Month 4 I almost begged for my old role back. Month 7 a single email arrived that made me glad I never sent it.", "Identity stakes. Career-pivot narratives convert across every demographic that's ever felt stuck."],
    [92.4, "The [Number] free tools that replaced my $[Amount]/mo SaaS stack", "Cancelled 7 subscriptions. Stack actually got faster. Tool #4 is one I'd never seen mentioned anywhere — and it's open source.", "Cost-cutting + discovery. List + dollar figure is one of YouTube's most reliable thumbnail combos.", true],
    [91.9, "How I went from $0 to $[MRR] MRR in [Months] months — no audience, no funding", "I tried the playbook everyone preaches. It failed. Then I did the one thing every guru tells you not to do.", "Underdog + contrarian. The 'against advice' twist removes the 'easy for you' objection."],
    [91.5, "The landing page I rewrote in 30 minutes that 3x'd my conversion", "Same product. Same traffic. New page. The change that mattered most wasn't a headline — it was a 2-word section label.", "Micro-optimization + outsized result. Tiny-change-big-impact is the most rewatched copywriting frame."],
    [91.1, "I tried [Famous Founder]'s growth playbook for 60 days. Here's what actually worked.", "Three things from the playbook saved me a year of trial and error. Two things actively hurt my conversion. I'll save you the test.", "Authority + filter. Doing the work for the viewer is the whole value prop."],
    [90.7, "Don't build [Trendy Product] — build the [Unsexy Alternative] instead", "Less hype. Less competition. Way better margins. I'll show you the math nobody on Twitter wants to share.", "Anti-hype guidance. Contrarian niche advice has the highest save-to-watch ratio in indie content."],
    [90.3, "The 90-day [Marketing Channel] experiment that I'm rolling out to every project", "I almost gave up on day 35. Day 41 something flipped — and the channel went from 0 to my #1 source of paid signups.", "Persistence + payoff. Timeline-based experiment formats keep viewers to the reveal."],
    [89.9, "How I get [Famous People] to reply to my cold outreach", "It's not the subject line. It's not the AI personalization. It's a small framing trick I stole from journalists.", "Negation + cross-discipline secret. Telling the viewer what it ISN'T builds insane curiosity."],
    [89.5, "I outsourced my [Function] to [Specific Country/Service] for [Time]. The result?", "I expected savings. I got something I didn't even know I was looking for — and one painful lesson about scoping work.", "Experiment + ambiguity. The unspecified 'result' is the reason to click."],
    [89.1, "Why I shut down a profitable [Product Type] (and what I'm building instead)", "It was making money. Customers loved it. And it was eating my life. The numbers nobody warns you about.", "Counterintuitive shutdown. Quitting a winner is one of the most-discussed indie hacker decisions."],
    [88.7, "[Number] indie hackers making $10K+/mo — here's the one thing they all do", "I interviewed each of them. Different niches, different products, different stacks. One habit was identical.", "Pattern across success stories. Aggregator content punches far above its production cost."],
    [88.3, "I rebranded my [Product] from [Old] to [New]. Revenue did this.", "Same product. New name, new positioning, one new word in the homepage h1. The chart speaks for itself.", "Visual proof framing. 'The chart speaks' invites the click to see the chart."],
    [87.9, "The customer interview question that completely changed my roadmap", "I'd been asking the wrong thing for 18 months. This single question surfaced a feature my best customers were quietly desperate for.", "Single-question payoff. Discrete-takeaway titles outperform multi-tip lists for advanced audiences.", true],
    [87.5, "How I write [Number] cold emails in 30 minutes (and they don't feel automated)", "It's a 3-block template + 2 minutes of stalking. The reply rate is 7x higher than the bulk tools I tested.", "Efficiency + craft. The 'doesn't feel automated' phrase wins because everyone hates spam."],
    [87.1, "I tried selling [Product] at [Crazy High Price]. People paid.", "I thought I'd get laughed off the internet. Instead, the high price became the marketing. Here's why expensive sometimes works.", "Audacious pricing experiment. Premium-pricing content is highly saved by serious operators."],
    [86.8, "The [Distribution Channel] nobody on Twitter is talking about (yet)", "I've gotten more qualified signups from this in 30 days than from a year of LinkedIn. Window's closing.", "Hidden channel + urgency. Untapped-channel content has unusually high share rates."],
    [86.4, "I built and sold a [Product] for $[Amount] in [Time]. AMA, here's the timeline.", "Day-by-day breakdown including the moment I almost ghosted the buyer. If you're chasing an exit, watch the part at 8:12.", "Transparency + acquisition arc. Exit stories are catnip for the indie hacker audience."],
    [86.0, "Why my failed startup taught me more than my successful one", "The win felt random. The failure was a 9-chapter textbook. I'll give you chapter 4 — the one I wish someone had handed me at 25.", "Wisdom + vulnerability. Failure-essay content has the highest comment depth in the niche."],
    [85.7, "The [Niche] business I'd build if I were starting over today", "Tiny market. Boring problem. Annoying customers — in the best way. Here's the exact business plan I'd execute on day one.", "Reset framing + giveaway. 'If I were starting over' is one of the most clicked indie hacker hooks of all time."],
  ]),

  productivity: mk("p", [
    [98.0, "The [Time]-hour work week is a lie (this [Number]-minute system is actually effective)", "I've tested every productivity book on this shelf. None of them survived a real Tuesday. This one did.", "Sacred-cow takedown. Calling out a famous concept invites both fans and critics to click.", true],
    [97.4, "The [Number] micro-habits that will completely [Goal] your productivity", "Each one takes under 90 seconds. Stacked together, they replaced an $80/mo coaching subscription I no longer need.", "Low-effort + outsized claim. Micro-habit content has the highest save rate in the niche."],
    [96.9, "[Famous High Performer]'s time blocking method: how to get 2 days of work done in 1", "I tried it the first week and almost quit. The second week I scheduled fewer blocks. The output graph speaks for itself.", "Authority steal + visual proof. Borrowing a name accelerates trust by years."],
    [96.4, "My exact process for managing [Number] projects at once (without burnout)", "It's not Notion. It's not Asana. It's one 5-line text file I open every morning and close at 5:30pm sharp.", "Anti-tool stance. Pushing back on app-bloat is universally relatable to overwhelmed creators."],
    [95.9, "I organized my entire life with [Obscure Tool] and I've never been happier", "It's free, it's open source, and it looks like it was designed in 2003. None of that matters once you experience the speed.", "Underdog + transformation. Obscure-tool discovery videos have the highest comment engagement of any productivity format.", true],
    [95.4, "I tried [Famous Person]'s morning routine for [Days] days — the results were unhinged", "By day 9 I was convinced it was nonsense. By day 21 I refused to give it up. Here's what nobody warns you about.", "Skeptic-to-believer arc. The honest doubt earns the conversion."],
    [94.9, "Delete these [Number] apps right now if you actually want to focus", "Number 3 is the one disguised as a productivity tool. I had it on my home screen for two years stealing my best hours.", "Imperative + insider warning. 'Disguised as productivity' is the perfect curiosity loop."],
    [94.5, "The [Method] system that made me [Result] without burning out", "I used to chase every new productivity trend. Then I built a single one-page template that quietly replaced all of them.", "Convergence + permission to stop searching. Tired audiences click anything that promises an end to the optimization treadmill."],
    [94.0, "Why your [Tool] setup is sabotaging you (and the 5-minute fix)", "You don't need a new app. You need to change one default setting that ships hostile to deep work out of the box.", "Anti-consumerism + quick win. Telling viewers they DON'T need new software is refreshingly counterintuitive."],
    [93.6, "I tracked every hour for [Days] days. The result was depressing — and freeing.", "Turns out I wasn't lazy. I was bleeding 3 hours a day to one specific category I would have sworn was 'just minutes.'", "Self-tracking confession. Quantified-self vulnerability scores very high on retention."],
    [93.1, "The 2-minute morning rule that replaced my $300/mo coach", "It's not journaling. It's not meditation. It's one written question I answer before my feet hit the floor.", "Cost replacement + negation. Naming what it ISN'T builds the curiosity gap that makes viewers click.", true],
    [92.7, "How I do deep work for [Hours] hours straight without checking my phone", "It's not willpower. It's not discipline. It's a 3-part environment hack that makes distraction physically annoying.", "Reframe willpower → environment. Environment-design content outperforms motivation content 4:1."],
    [92.3, "I quit [Productivity App] after [Years]. Here's the better-for-you alternative.", "I was paying $9/mo to feel guilty. The replacement is free, faster, and shaped my behavior in a way the app never did.", "Defection narrative + guilt acknowledgement. Honesty about user-hostile apps converts very high."],
    [91.9, "The 3-folder system that ended my email anxiety forever", "Inbox zero is a scam. This is the system from a former assistant to a [Title] that actually scales past 1,000 emails/day.", "Folk wisdom challenge + authority. 'Inbox zero is a scam' alone is a thumbnail-tested winner."],
    [91.5, "I read [Number] productivity books so you don't have to. Only 3 mattered.", "$280 spent. 38 hours read. The 3 worth your time give the same advice from different angles — and one of them is almost free.", "Sacrifice + filter. Curated lists from someone who suffered through the data are a high-trust shortcut."],
    [91.1, "Why I work [Counterintuitive Schedule] (and produce more than I ever did 9-5)", "I get my best work done before sunrise and after dinner. The middle of the day is for the work everyone else thinks is the work.", "Lifestyle reframe. Schedule-based content has long evergreen lift."],
    [90.7, "The [Tool] template that runs my entire [Business/Life]", "Building it took 2 hours. Maintaining it takes 4 minutes a week. Stealing it takes 30 seconds — link in the description.", "Free artifact promise. Tangible giveaways anchored in proof drive subscribe rates."],
    [90.3, "I deleted [Number] tasks from my to-do list. My income went up.", "I had 47 'priorities.' I now have 4. The math on what got cut is uncomfortable for anyone who calls themselves busy.", "Less = more. Subtraction content scores higher than addition content in productivity by a wide margin."],
    [89.9, "How [Highly Successful Person] runs their day (according to people who worked with them)", "Forget the carefully PR'd version. Three former assistants told me what actually happens between 9am and 6pm. Two details surprised even me.", "Behind-the-curtain authority. Second-hand authority content can outperform first-person if the source feels real."],
    [89.5, "The 'second brain' that replaced my second brain", "I bought the course. I followed the system. Then I rebuilt it as 4 files I actually open daily. Here's the simpler version.", "Simplification arc + meta-commentary. Backlash-to-overcomplexity videos are quietly the fastest-growing productivity sub-genre."],
    [89.1, "I tried [Famous Productivity Method] for 90 days. Here's the honest truth.", "Three things genuinely worked. One thing was a lie. One thing was so weird it became my favorite part — and the creator never mentions it.", "Long test + honest verdict. 90-day formats out-watch 30-day formats by 1.7x on average."],
    [88.7, "The single calendar habit that made me [Outcome]", "It's not blocking. It's not theming. It's an end-of-day 90-second ritual that compounded into the most controlled year of my life.", "Single-tip discrete value. Discrete-habit videos have the highest click-to-completion ratio."],
    [88.3, "Stop using [Note App]. Use a notebook for 30 days. Here's what happens.", "I expected to feel old. I felt 10x sharper. The brain-on-paper effect is real and the research is wilder than I thought.", "Anti-tech in tech-saturated niche. Reactionary advice spikes when audiences are tool-fatigued.", true],
    [88.0, "How I plan my week in 12 minutes (using only paper)", "I tried digital. I tried apps. I tried AI assistants. The system I keep coming back to fits on the back of an index card.", "Minimum-viable system. Constraint-based content is exceptionally shareable."],
    [87.6, "The reason your morning routine isn't working (it's not what you think)", "It's not the routine. It's not your willpower. It's a 4-second decision you're making before your routine even starts.", "Pre-routine reveal. 'Before the routine' is a productivity trope viewers haven't been burned out on yet."],
    [87.2, "I lived by [Famous Schedule] for a month. My productivity did this.", "I followed it to the minute. Three rules survived. Two destroyed my evenings. One I'm keeping forever.", "Granular verdict. Specific kept/cut breakdowns convert better than blanket reviews."],
    [86.9, "The [Number]-minute weekly review that prevents burnout", "I skipped it for 6 weeks last year. It cost me a hospitalization and a missed launch. I haven't skipped one since.", "Stakes + ritual. Personal-cost stories radically increase the perceived value of the recommended habit."],
    [86.5, "Why my best ideas come in [Specific Place] (and what I do about it)", "There's actual neuroscience behind why this works — and a 3-step protocol that captures them before they evaporate.", "Curiosity + neuroscience credibility. Brain-based productivity has outsized credibility lift in 2026."],
    [86.2, "I batched [Activity] for 90 days. My output went up. My stress went down.", "I always thought batching was a marketing buzzword. Then I tried it on the one task I dreaded most. The relief was instant.", "Personal-test format. Single-experiment productivity content is reliably evergreen."],
    [85.8, "How I say no to [Number]% of requests without burning a single bridge", "It's not a script. It's a frame. Once you internalize it, the email writes itself — and the relationship gets stronger.", "Soft-skill reframe. Politics-adjacent productivity advice has surging demand among managers."],
  ]),
};

// "Mixer Pick" cross-niche patterns — one is injected into every shuffle.
export const MIXER_PICKS: Idea[] = [
  {
    id: "mx1",
    score: 98.6,
    formula: "The exact [Productivity Method] that helped me automate my [Tech SaaS] agency to $[Amount]/mo",
    hook: "I used to think productivity hacks were for office workers. Then I wired one into my agency's onboarding and watched my calendar empty itself.",
    why: "Cross-niche fusion (Productivity × Tech × Solopreneur) triggers click-throughs from three audiences simultaneously. Specificity in every bracket signals 'real story.'",
    featured: true,
  },
  {
    id: "mx2",
    score: 97.9,
    formula: "I let [AI Agent] run my [Indie SaaS] for a week using only [Streamer's] [Game] strategy",
    hook: "Sounds insane. Worked anyway. The lessons from a top-100 player turned out to apply scarily well to a $4k/mo product.",
    why: "Forbidden-combination hook. Audiences love unlikely metaphor transfers — they feel novel even when the underlying advice is familiar.",
    featured: true,
  },
  {
    id: "mx3",
    score: 97.3,
    formula: "How [Famous Founder]'s morning routine and a [No-Code Tool] tripled my [Niche] business in [Months] months",
    hook: "I stole the routine. I stole the stack. I stitched them together with one custom workflow. The growth chart is the whole video.",
    why: "Authority steal + stack reveal + transformation. Three high-CTR levers pulled simultaneously.",
    featured: true,
  },
  {
    id: "mx4",
    score: 96.8,
    formula: "I applied [Speedrunning Technique] to my [Email Inbox] and saved [Hours] hours a week",
    hook: "Frame-perfect inputs. Optimal routing. Glitch exploitation. Turns out the gamer brain has been training for productivity all along.",
    why: "Sub-culture transfer. Gaming-to-life-skills framing pulls in two non-overlapping audiences and earns shares from both.",
    featured: true,
  },
  {
    id: "mx5",
    score: 96.2,
    formula: "Using [AI Coding Agent] + [Productivity System] to ship a $[Amount] [SaaS] before my coffee got cold",
    hook: "I gave myself 47 minutes. I left with a live Stripe link. The combo was the trick — neither tool alone would have worked.",
    why: "Time pressure + dollar outcome + tool combination. Maximum payoff density for a 60-character title.",
    featured: true,
  },
  {
    id: "mx6",
    score: 95.7,
    formula: "Why [Top Streamer]'s habits are secretly the best [Solopreneur] playbook of [Year]",
    hook: "I studied 40 hours of stream VODs. The patterns mapped 1:1 onto building a one-person company. Most founders are missing it.",
    why: "Reframe + adjacent expertise. Audiences trust deep observation more than recycled bullet points.",
    featured: true,
  },
];
