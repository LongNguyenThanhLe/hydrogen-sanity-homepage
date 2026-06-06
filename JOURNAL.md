# Engineering Journal — Hydrogen + Sanity Home Page

> A running log of decisions, dead-ends, and rationale as I build this project. Newest entries at the top of each stage. I keep this because _why_ I made a choice matters as much as the choice itself.

---

## The Assignment

Build a dynamic, editor-friendly Home Page experience (plus one other page, my choice) using Sanity as the content source and Shopify Hydrogen as the consumer. Everything runs locally — no hosting, no paid services.

Things I want to demonstrate by the review:

- Sanity as content source → Hydrogen as consumer, end to end
- A real editing experience (log into Sanity, edit, see it reflected in Hydrogen)
- Clean handling of dev env, secrets, and toolchain
- Portable Text rendered through my own React components
- Sensible decisions, each with a stated reason

---

## Where I'm Starting From

- **Familiar:** TypeScript, React, and modern JS day-to-day. Backend work in Rust and Node. Comfortable with REST/GraphQL-style data fetching, Docker, and Git-based workflows.
- **New to me:** Shopify Hydrogen and Sanity specifically. So part of this exercise is genuinely "how do I ramp on an unfamiliar stack fast" — which is the real job. I'll lean on the React/TS transfer where I can and journal the parts that surprise me.
- **Environment:** Node v22.13.1, macOS. Public repo on my personal GitHub.

---

## Plan / Stages

A rough build order. Expect this to change — I'll note it when it does.

- [x] **Stage 0 — Foundation.** Repo, Node check, this journal.
- [x] **Stage 1 — Scaffold Hydrogen.** Get a storefront running locally.
- [x] **Stage 2 — Scaffold Sanity Studio.** Create the project + Studio, decide where it lives relative to the Hydrogen app.
- [x] **Stage 3 — Wire them together.** First real win: text typed in Studio shows up on the Hydrogen home page.
- [ ] **Stage 4 — Portable Text + second page type.** Rich content rendered through my own components; add the second page; handle Sanity images.
- [ ] **Stage 5 (stretch) — Visual editing / live preview.** Click-to-edit overlays if time allows, without risking the working core.
- [ ] **Stage 6 — Polish.** README, clean from-scratch run, rehearse the demo.

---

## Open Questions / Things to Resolve

**Question 1 — GraphQL vs GROQ for consumption.** The brief mentions GraphQL on the Sanity side. First read of the official `hydrogen-sanity` toolkit suggests GROQ is the default/recommended path, with GraphQL also supported. Need to confirm the tradeoff and pick one deliberately. _(Revisit in Stage 3.)_

-> Decision: Choose GraphQl.
-> Confirm tradeoff: GROQ is Sanity's native and official recommended query language - more flexible, works without a schema-deploy step, supports real-time/listening(which GraphQL subscriptions dont)
-> Reason: The Shopify Storefront API speaks GraphQL by design, so using GraphQL for Sanity too means both data sources in my Hydrogen loaders share one query language and one mental model, rather than context-switching between GraphQl and GROQ mid-loader
-> Tradeoffs I'm accepting: the schema-deploy step on the Sanity side, and the loss of GROQ-based real-time subscriptions—acceptable here because the content is straightforward and live editorial subscriptions aren't a requirement for this build

---

## Decision Log

Format: **Decision** — what I chose. **Why** — the reasoning. **Tradeoff** — what I gave up / when I'd choose differently.

### Stage 1 — Scaffold Storefront

**Decision:** When I merged the Hydrogen scaffold into my existing repo, the `cp -R` overwrote my repo `.git` with the scaffold's history, which dropped my remote and my Stage-0 commit. Rather than fight it, I kept the scaffolder's granular commits (they document the real build steps), re-pointed the remote at my GitHub repo, committed the journal on top, and force-pushed since the remote has no real history yet.

**Why:** The scaffolder's commits are a more honest record of the build than my single Stage-0 commit, and the remote had nothing worth preserving.

**Tradeoff:** Force-pushing rewrites history — fine here because I'm the only contributor and the remote was effectively empty. I'd never do this on a shared branch with real history.

### Stage 2 — Scaffold Sanity Studio

1. Where does the studio live?
   **Decision:** I decided to subfolder the studio inside my Hydrogen repo (a /studio folder).

   **Why:** It keeps everything in one repo, but keep the two app as clean, independently-runnable projects(Hydrogen on :3000, Studio on :3333).

2. What does a "Home Page" look like as structured data?
   **Decision:** - A homePage document with a title and a section[] array
   - heroSection - heading(string), subheading(string), background image, CTA(label + link). The classic top-of-page banner
   - featuredCollection - a heading + a way to reference products. Hook to the Shopify side
   - richTextSection - a Portable Text field.

   **Why:** each section type becomes a matching React component in Hydrogen. Studio editor picks "add a Hero section," fill the field and Hydrogen renders the corresponding <HeroSection>. That one-to-one mapping between Sanity section types and React componenents is the core idea of editor-friendly headless content

### Stage 3 — Wire them together

1. Model the home page as a section[] array of typed blocks(hero/ richText / featuredProduct) rather than fixed fields, so editor compose pages freely
2. the page document resuses the same section types -> about page is build from the same section types
3. featuredProducts stores Shopify handles, not product data - Sanity owns the editorial choice, Hydrogen fetches live commerce data from the Storefront API
4. Hit a version mismatch wiring hydrogen-sanity. The first setup example I found used a synchronous createSanityContext with a loadQuery pattern. Checked the installed version against the MIGRATE-v4-to-v5 doc and found v5 made createSanityContext async and changed its args to {request, cache, client} (no more waitUntil). Updated the factory to async and used Awaited<ReturnType<...>> for the context type.

---

## Daily Log

### [Jun 4] — Stage 0

Set up the public repo, confirmed Node v22.13.1, wrote this journal.

Goal for next session: scaffold Hydrogen, get a storefront running locally.

### [Jun 4] — Stage 1

Option A (simplest): scaffold into a fresh folder, then move the generated files into the existing cloned repo. Keeps the repo as the single root.

**The runbook**

```bash
cd ~
npm create @shopify/hydrogen@latest
```

Scaffolder prompts and my answers:

- **Connect to Shopify?** → Use sample data from Mock.shop (no login required)
- **Styling?** → Tailwind
- **Language?** → TypeScript
- **Install dependencies?** → Yes
- **Markets?** → Set up later (`npx shopify hydrogen setup markets`)

Declined multi-market setup — out of scope for this exercise; keeps the route structure simple and focused on the content integration. Would revisit if the brief involved international expansion.

```bash
cd hydrogen-temp && npm run dev
cp -R . ../hydrogen-sanity-homepage/
cd ../hydrogen-sanity-homepage
```

**Stage 1 done:** Hydrogen running on Mock.shop, pushed. Next: scaffold Sanity Studio (Stage 2), decide embedded-in-repo vs separate folder.

### [Jun 5] — Stage 2

**The runbook**

```bash
cd ~/hydrogen-sanity-homepage
npm create sanity@latest -- --template clean --typescript --output-path studio
```

Scaffolder prompts and my answers:

- **Login / create account?** → Google
- **Create a new project** → luxome-homepage
- **Language?** → TypeScript
- **Package manager** → npm
- **Configure Sanity MCP and install agent skills for these editors?** → skip all

```bash
cd /studio && npm run dev
```

**Note** ProjectId which is later for Hydrogen side is in /studio/sanity.config.ts

### [Jun 6] — Stage 3

**Plan**

1. Write Schema in Studio(hero/featured/richText sections + homePage doc), create content, see it in Studio.

- heroSection.ts:
- richTextSection.ts: Portable text live
- homePage.ts: compose section(Hydrogen will query "the home page." Don't make several - harden)
- page.ts: second page - my choice(About page)
- index.ts: register them all

2. Install + wire hydrogen-sanity into the Hydrogen app(Vite plugin + context)

```bash
cd ~/hydrogen-sanity-homepage
npm install hydrogen-sanity @sanity/client
```

3. Set the env vars(projectId, dataset) on the Hydrogen side.
   Edit 1 — Add Sanity env vars to .env

```bash
grep projectId studio/sanity.config.ts
PUBLIC_SANITY_PROJECT_ID="YOUR_PROJECT_ID"
PUBLIC_SANITY_DATASET="production"
```

Edit 2 — Tell TypeScript about the new env vars
env.d.ts — the declare global augmentation above

Edit 3 — vite.config.ts, add the sanity plugin. Add this import near the other plugin imports:

```bash
import {sanity} from 'hydrogen-sanity/vite';
```

add sanity() to the plugins array, right after hydrogen()

Edit 4 — app/lib/sanity.ts
app/lib/sanity.ts — create with the corrected async factory

Edit 5 — app/lib/context.ts
app/lib/context.ts — import, type change, async build + pass {sanity}

4. Query in loader + render - expect: text from studio appears on Hydrogen home page.
