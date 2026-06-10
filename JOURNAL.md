# Engineering Journal — Hydrogen + Sanity Home Page

> A running log of decisions, dead-ends, and rationale as I built this. Newest
> notes added under each stage as I went. I keep this because _why_ I made a
> choice matters as much as the choice itself — and because the debugging detours
> are the honest part of building on an unfamiliar stack.

---

## The Assignment

Build a dynamic, editor-friendly Home Page experience (plus one other page, my
choice) using **Sanity** as the content source and **Shopify Hydrogen** as the
consumer. Everything runs locally — no hosting, no paid services.

What I wanted to demonstrate by the review:

- Sanity as content source -> Hydrogen as consumer, end to end
- A real editing experience (log into Sanity, edit, see it reflected in Hydrogen)
- Clean handling of dev environment, secrets, and toolchain
- Portable Text rendered through my own React components
- Sensible decisions, each with a stated reason

## Where I Started From

- **Familiar:** TypeScript, React, modern JS day to day. Backend in Rust and
  Node. Comfortable with REST/GraphQL-style fetching, Docker, Git workflows.
- **New to me:** Hydrogen and Sanity specifically. So part of this was genuinely
  "how do I ramp on an unfamiliar stack fast" — which is the real job. I leaned on
  the React/TS transfer where I could and journaled the parts that surprised me.
- **Environment:** Node v22.13.1, macOS, public repo on my personal GitHub.

## Progress

- [x] Stage 0 — Foundation (repo, Node check, this journal)
- [x] Stage 1 — Scaffold Hydrogen storefront
- [x] Stage 2 — Scaffold Sanity Studio
- [x] Stage 3 — Wire them together (content from Studio -> Hydrogen)
- [x] Stage 4 — Portable Text, second page type, images, refactor
- [ ] Stage 5 — Featured-product lookup + visual editing (scoped out, see below)

---

## Headline Decisions (the ones worth reading first)

**GROQ over GraphQL.** The brief mentioned GraphQL on the Sanity side. I looked
into both — Sanity supports each — but chose GROQ because it's what the official
`hydrogen-sanity` toolkit is built around: its caching and preview integration
all assume GROQ. Using GraphQL would mean fighting the tooling for no real gain on
content this simple. Deliberate deviation from the brief's wording, with reasons.

**Section-based content model.** A page is a `sections[]` array of typed blocks
(hero / richText / featuredProducts), not fixed fields — so editors compose pages
freely. Each section `_type` maps one-to-one to a React component via my
`SectionRenderer`. That mapping is the core idea of editor-friendly headless
content: the editor arranges blocks, the code controls how each renders. The
second page type (About) reuses the exact same section types.

**Sanity owns content, Shopify owns commerce.** The Featured section stores
Shopify product _handles_ in Sanity — the editorial choice of _what_ to feature —
while the live price/image would come from Shopify's Storefront API. Clean split:
Sanity picks what, Shopify provides the data.

---

## Stage 0 — Foundation (Jun 4)

Set up the public repo, confirmed Node v22.13.1, wrote this journal.
Next: scaffold Hydrogen.

## Stage 1 — Scaffold Hydrogen (Jun 4)

Scaffolded into a fresh folder, then moved the generated files into my cloned
repo (keeps the repo as the single root).

```bash
cd ~
npm create @shopify/hydrogen@latest
```

Prompt answers: Mock.shop sample data (no login needed) - Tailwind - TypeScript -
install deps - markets -> "set up later."

- **Declined multi-market setup** — out of scope; keeps the route structure simple
  and focused on the content integration. Would revisit for international.

```bash
cd hydrogen-temp && npm run dev      # confirmed it runs
cp -R . ../hydrogen-sanity-homepage/
cd ../hydrogen-sanity-homepage
```

**Debugging detour — git history collision.** The `cp -R` overwrote my repo's
`.git` with the scaffold's history, dropping my remote and my Stage-0 commit.
Rather than fight it, I kept the scaffolder's granular commits (they document the
real build steps), re-pointed the remote at my GitHub repo, committed the journal
on top, and force-pushed — fine here since I'm the only contributor and the remote
was effectively empty. I'd never force-push a shared branch with real history.

Stage 1 done: Hydrogen running on Mock.shop, pushed.

## Stage 2 — Scaffold Sanity Studio (Jun 5)

```bash
cd ~/hydrogen-sanity-homepage
npm create sanity@latest -- --template clean --typescript --output-path studio
```

Prompt answers: Google login - new project `luxome-homepage` - TypeScript - npm -
**skipped the Sanity MCP / agent-skills install** (wanted the repo to reflect my
own setup, not auto-injected tooling).

- **Studio location decision:** put the Studio in a `/studio` subfolder inside the
  Hydrogen repo. **Why:** everything stays in one repo (one place for the reviewer,
  one commit history) but the two apps stay clean and independently runnable —
  Hydrogen on :3000, Studio on :3333. Embedding the Studio as a Hydrogen route
  would add coupling without buying anything here.
- The `projectId` Hydrogen needs later lives in `/studio/sanity.config.ts`.

## Stage 3 — Wire them together (Jun 6)

**Content model (in `studio/schemaTypes/`):** `homePage` and `page` documents,
each a `title` + `sections[]`. Section objects: `heroSection`,
`richTextSection`, `featuredProductsSection`. Both documents share the section
types, so About is built from the same blocks as Home.

**Install + wire the toolkit:**

```bash
npm install hydrogen-sanity @sanity/client
```

Then: Sanity env vars in `.env` (`PUBLIC_SANITY_PROJECT_ID`,
`PUBLIC_SANITY_DATASET`) - `declare global` augmentation in `env.d.ts` -
`sanity()` plugin in `vite.config.ts` - a `createSanityClient` factory in
`app/lib/sanity.ts` - wired into `app/lib/context.ts` so every loader gets
`context.sanity` (first-class, alongside `context.storefront`).

**Debugging detour — v4->v5 API change.** The first setup example I found used a
synchronous `createSanityContext` with a `loadQuery` pattern. Checked the
installed version against the MIGRATE-v4-to-v5 doc: v5 made `createSanityContext`
**async** and changed its args to `{request, cache, client}` (no more
`waitUntil`). Updated the factory to async and used `Awaited<ReturnType<...>>`
for the context type. Lesson: the toolkit moves fast — verify against the
migration guide for the version you actually have, not the first snippet online.

**Query + render.** GROQ query (`*[_type == "homePage"][0]{ ... }`) in the
loader via `context.sanity.query`, run in parallel with the Shopify query;
result passed to the component and rendered by switching on `section._type`.

**First win:** text typed in Studio shows up on the Hydrogen home page.

**Intentionally left unfinished at this stage (named, not forgotten):**

- Rich text rendered a placeholder — Portable Text is structured blocks, not a
  string, and needs a dedicated renderer. Proved the pipeline first; renderer next.
- Featured section rendered the raw handle, not a product card (commerce-data
  fetch is a separate step).
- Typed `home` as `any` to get the data flowing — TypeGen would generate proper
  types from the GROQ queries. Loose now, tighten as a hardening step.

## Stage 4 — Portable Text, second page, images, refactor (Jun 6-9)

**Portable Text** (`app/components/PortableTextRenderer.tsx`). Built a custom
components map: block styles, marks, and lists each map to my own elements. The
showpiece is the `link` mark — internal hrefs (starting with `/`) render
react-router's `<Link>` for client-side nav, external ones a plain anchor. The
editor writes a link; I decide how links behave.

- **Detour — invisible bullets.** Lists rendered structurally correct but markers
  were invisible: Tailwind's preflight reset sets `list-style: none`. Added
  explicit list CSS. Reinforced the core idea — Portable Text owns structure, the
  consuming app owns presentation.

**Second page (About)** via the dynamic route `app/routes/pages.$handle.tsx`.

- **Detour — route collision.** Adding `pages.$slug.tsx` silently collided with
  the scaffold's existing `pages.$handle.tsx` — both claim `/pages/:param`, and
  the pre-existing one won, so my route never ran and 404'd. Diagnosed by first
  ruling out the data layer with Sanity's Vision tool (the doc existed and was
  published), then `ls`-ing the routes folder and spotting the duplicate.
  Consolidated my Sanity logic into the existing `$handle` route. Lesson: in
  file-based routing, check for an existing route owning a pattern before adding
  one — silent collisions are harder to debug than a crash. Also dropped the
  Shopify-specific `redirectIfHandleIsLocalized` call — irrelevant to Sanity pages.

**Refactor — `SectionRenderer`.** The section `switch` was copy-pasted across the
home and dynamic-page routes. Extracted it into one component, each section type
its own sub-component. Single source of truth for the type->component mapping —
adding a section type is now a one-file change. Verified both pages render
identically after; pure refactor, no behavior change.

**Images.** Sanity stores uploads on its CDN; the document holds a reference. I
build optimized URLs (`.width(...).auto('format')`) so the CDN serves a sized,
modern-format variant, with the editor's hotspot respected.

- **Detour 1 — wrong tool.** Tried the toolkit's `useImageUrl` hook; it threw
  "Failed to find a Sanity provider" — the hook needs a `SanityProvider` context
  geared toward visual editing, which I hadn't set up. Rather than add that
  coupling just for image URLs, switched to the standalone `@sanity/image-url`
  builder — a plain function, no provider.
- **Detour 2 — `undefined` projectId.** Image came back grey; the generated URL
  was `cdn.sanity.io/images/undefined/undefined/...`. `import.meta.env.PUBLIC_*`
  resolves to undefined in the Oxygen server context, so the builder got no
  projectId. Sourced projectId/dataset directly in the helper — safe since
  they're not secrets (public dataset), though the cleaner pattern threads them
  from server env. Noted as a refactor.
- **Detour 3 — CSP block (favorite one).** Image still grey, but the URL was
  valid (loaded fine in a standalone tab) and the CSS correct. The Network tab
  showed the request **blocked**. Root cause: Hydrogen ships a strict
  Content-Security-Policy, and `cdn.sanity.io` wasn't in `img-src` — the browser
  refused to load it inside the app. Added Sanity's CDN to the CSP `imgSrc`
  directive. Real headless concern: pulling assets from a second platform into a
  Hydrogen storefront means explicitly trusting that origin in the CSP. Applies to
  fonts, scripts, and the Sanity API connection (`connect-src`) too in a fuller
  build.

**Detour — stale live edits.** Published edits weren't appearing on refresh, even
with `useCdn: false`. Confirmed via Vision (published perspective) that Sanity
_did_ have the new value — so the staleness was Hydrogen-side, not Sanity. The
toolkit wraps queries in Hydrogen's sub-request cache, a second cache layer in
front of the CDN. Passed `CacheNone()` to the query in dev so edits show
immediately. In production I'd keep caching on for performance and use preview
mode for instant editorial feedback — so this is a dev-only setting, not how I'd
ship it.

## Stage 5 — Scoped out, deliberately

**Featured-product lookup.** The Featured section stores Shopify handles (the
editorial choice). The next step is resolving each handle against the Storefront
API to render a live product card (price, image, title) — the data model and
rendering path are already in place; this is the commerce-fetch layer on top. I
scoped it out to protect a working demo the day before review rather than add
net-new loader code last-minute. Clean example of the Sanity-picks-what /
Shopify-provides-the-data split, and a deliberate tradeoff call.

**Visual editing / live preview.** The toolkit supports click-to-edit overlays
via `SanityProvider` + `@sanity/visual-editing`. Left as a stretch — it's the
flashiest piece but also the most coupling and the most risk close to the
deadline. Understood the mechanism; chose not to ship it.

## What I'd do next

- Resolve featured handles against the Storefront API (real product cards).
- Sanity TypeGen for end-to-end typed content (replace the `any`s).
- Thread projectId/dataset from server env instead of the inline fallback.
- Visual editing for instant editorial preview.
