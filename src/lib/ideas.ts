export type Idea = {
  id: string;
  score: number;
  formula: string;
  hook: string;
};

export type NicheKey = "tech-ai" | "gaming" | "solopreneur" | "productivity";

export const NICHES: { key: NicheKey; label: string }[] = [
  { key: "tech-ai", label: "Tech & AI" },
  { key: "gaming", label: "Gaming" },
  { key: "solopreneur", label: "Solopreneur / Indie Hacking" },
  { key: "productivity", label: "Productivity" },
];

export const IDEAS: Record<NicheKey, Idea[]> = {
  "tech-ai": [
    {
      id: "ta1",
      score: 97.4,
      formula: "I replaced my entire [Workflow] with [This Crazy AI Tool] for 7 days",
      hook: "Most people are still doing this the slow way. I almost quit on day 2 — then something clicked that changed everything.",
    },
    {
      id: "ta2",
      score: 95.1,
      formula: "[Big Tech Company] just quietly killed [Popular Product] — here's what nobody noticed",
      hook: "Buried in a 40-page changelog was a single line that completely rewrites how the industry works. Let me decode it.",
    },
    {
      id: "ta3",
      score: 92.8,
      formula: "The [Number]-second AI prompt that does the work of a $[Amount] [Specialist]",
      hook: "I tested this on three real client projects. The output was so good my freelancer asked if I'd hired someone else.",
    },
    {
      id: "ta4",
      score: 90.3,
      formula: "Why [Trending Framework] is a trap (and what senior devs use instead)",
      hook: "I shipped production code with it for six months. Here's the exact moment I realized I'd been sold a beautiful lie.",
    },
    {
      id: "ta5",
      score: 87.6,
      formula: "I built a [Product] in [Time] using only [Specific Stack] — full breakdown",
      hook: "No team, no budget, no prior experience in this niche. Just one weekend, one laptop, and a stupidly simple idea.",
    },
  ],
  gaming: [
    {
      id: "g1",
      score: 98.2,
      formula: "I beat [Hardest Boss] using only [Worst Weapon] — and discovered something broken",
      hook: "Everyone said this was impossible. Twelve hours in, I found a mechanic the devs definitely did not intend.",
    },
    {
      id: "g2",
      score: 94.7,
      formula: "[Pro Player] reacts to my [Rank] gameplay and tells me the brutal truth",
      hook: "I thought I was decent. Three minutes in, they paused the clip and said the one sentence that fixed my aim forever.",
    },
    {
      id: "g3",
      score: 91.5,
      formula: "The [Game] setting 99% of players have wrong (and pros never talk about)",
      hook: "I dug through 14 pro config files looking for the edge. They all had this one obscure value changed from default.",
    },
    {
      id: "g4",
      score: 89.0,
      formula: "Speedrunning [Classic Game] in [Time] using a glitch from [Year]",
      hook: "A forum post from 2008 had the answer the whole time. Nobody believed it worked until I caught it on a world record run.",
    },
    {
      id: "g5",
      score: 86.4,
      formula: "I spent $[Amount] on [In-Game Item] so you don't have to",
      hook: "Was it worth it? Honestly, the answer surprised even me — and it's not the one the publisher wants you to hear.",
    },
  ],
  solopreneur: [
    {
      id: "s1",
      score: 96.8,
      formula: "How I went from $0 to $[MRR] MRR in [Months] months — no audience, no funding",
      hook: "I tried the playbook everyone preaches. It failed. Then I did the one thing every guru tells you not to do.",
    },
    {
      id: "s2",
      score: 93.9,
      formula: "I cold-emailed [Number] founders. [Number] replied. Here's the exact template.",
      hook: "Subject line was the whole game. Once I rewrote it to look like a forwarded message, the reply rate quadrupled overnight.",
    },
    {
      id: "s3",
      score: 91.2,
      formula: "The [Pricing Model] change that doubled my revenue without adding a single feature",
      hook: "Customers literally thanked me for the price increase. The trick wasn't the number — it was where I put it on the page.",
    },
    {
      id: "s4",
      score: 88.5,
      formula: "I shipped [Number] products in [Timeframe]. Only [Number] worked. Here's why.",
      hook: "The winners had nothing in common except one boring trait the failures all lacked. It's not what the Twitter gurus say.",
    },
    {
      id: "s5",
      score: 85.7,
      formula: "Quitting my $[Salary] job to build [Niche] was the worst best decision of my life",
      hook: "Month 4 I almost begged for my old role back. Month 7 a single email arrived that made me glad I never sent it.",
    },
  ],
  productivity: [
    {
      id: "p1",
      score: 95.6,
      formula: "I tried [Famous Person]'s morning routine for [Days] days — the results were unhinged",
      hook: "By day 9 I was convinced it was nonsense. By day 21 I refused to give it up. Here's what nobody warns you about.",
    },
    {
      id: "p2",
      score: 92.3,
      formula: "Delete these [Number] apps right now if you actually want to focus",
      hook: "Number 3 is the one disguised as a productivity tool. I had it on my home screen for two years stealing my best hours.",
    },
    {
      id: "p3",
      score: 90.0,
      formula: "The [Method] system that made me [Result] without burning out",
      hook: "I used to chase every new productivity trend. Then I built a single one-page template that quietly replaced all of them.",
    },
    {
      id: "p4",
      score: 88.1,
      formula: "Why your [Tool] setup is sabotaging you (and the 5-minute fix)",
      hook: "You don't need a new app. You need to change one default setting that ships hostile to deep work out of the box.",
    },
    {
      id: "p5",
      score: 86.9,
      formula: "I tracked every hour for [Days] days. The result was depressing — and freeing.",
      hook: "Turns out I wasn't lazy. I was bleeding 3 hours a day to one specific category I would have sworn was 'just minutes.'",
    },
  ],
};
