**Engineering Journal - Hydrogen + Sanity Home Page**
A running log of decisions, dead-ends, and rationale as I build this project. Newest entries at the top of each stage. I keep this because why I made a choice matters as much as the choice itself.

**The Assignment**
Build a dynamic, editor-friendly Home Page experience(Plus one other page my choice) using Sanity as the content source and Shopify Hydrogen as the consumer. Everything run locally - no hosting, no paid services.
Things I want to demonstrate by the review:

- Sanity as content source -> Hydrogen as consumer, end to end
- A real editing experience(log into Sanity, edit, see it reflected in Hydrogen)
- Clean handling of dev env, secrets, and toolchain
- Portable text rendered through my own React components
- Sensible decision, each with a stated reason

**Where I'm starting from**

- Familiar: Typecript, React, and modern JS day-to-day. Backend work in Rust and Node. Comfortable with REST/GraphQL-style data fetching, Docker, adn Git-based workflows.
- New to me: Shopify Hydrogen and Sanity specifically. So part of this exercise is genuinely "How do I ramp on an unfamiliar stack fast" - which is the real job. I'll lean on the React/TS transfer where I can and journal the parts that suprise me.
- Environment: Node v22.13.1, macOS. Public repo on my personal Github.

**Plan/Stages**
A rough build order. Expect this to change — I'll note it when it does.

Stage 0 — Foundation. Repo, Node check, this journal. (done)
Stage 1 — Scaffold Hydrogen. Get a storefront running locally.
Stage 2 — Scaffold Sanity Studio. Create the project + Studio, decide
where it lives relative to the Hydrogen app.
Stage 3 — Wire them together. First real win: text typed in Studio shows
up on the Hydrogen home page.
Stage 4 — Portable Text + second page type. Rich content rendered through
my own components; add the second page; handle Sanity images.
Stage 5 (stretch) — Visual editing / live preview. Click-to-edit overlays
if time allows, without risking the working core.
Stage 6 — Polish. README, clean from-scratch run, rehearse the demo.

\*_Open Questions / Things to Resolve_
Question 1: GraphQL vs GROQ for consumption. The brief mentions GraphQL on the Sanity side. First read of the official hydrogen-sanity toolkit suggests GROQ is the default/recommended path, with GraphQL also supported. Need to confirm the
tradeoff and pick one deliberately. (revisit in Stage 3)

**Decision Log**

Format: Decision — what I chose. Why — the reasoning. Tradeoff —
what I gave up / when I'd choose differently.

Stage 0 — Foundation

**Daily Log**
[Jun 4] — Stage 0

Set up the public repo, confirmed Node v22.13.1, wrote this journal.
Goal for next session: Scaffold Hydrogen. Get a storefront running locally.

[Jun 4] - Stage 1
Option A (simplest): Scaffold into a fresh folder, then move the generated files into your existing cloned repo. Keeps your repo as the single root.
**The runbook**
cd ~  
npm create @shopify/hydrogen@latest
Connect to Shopify? → Choose "Use sample data from Mock.shop (no login required).
Styling? Tailwind,
Language? → TypeScript
Install dependencies? → Yes.
Declined multi-market setup — out of scope for this exercise; keeps the route structure simple and focused on the content integration. Would revisit if the brief involved international expansion.
