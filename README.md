# Luxome — Hydrogen + Sanity Home Page

A take-home project: an editor-friendly, dynamic page experience built with
**Shopify Hydrogen** as the storefront and **Sanity** as the content source.
Editors compose pages from reusable content blocks in Sanity Studio; Hydrogen
renders them through typed React components.

Everything runs locally. No hosting, no paid services.

---

## What's here

- **Home page** (`/`) — composed entirely from Sanity content blocks.
- **Dynamic pages** (`/pages/:slug`, e.g. `/pages/about`) — a second page type,
  built from the same reusable blocks.
- **Section-based content model** — a page is an ordered array of typed sections
  (Hero, Rich Text, Featured Products). Each section type maps to one React
  component, so editors arrange the page and the code controls how each block
  looks.
- **Portable Text** — rich text rendered through custom components (headings,
  lists, and internal links that resolve to client-side `<Link>` navigation).
- **Sanity image pipeline** — images served from Sanity's CDN with on-demand
  transformations (width, format, editor-chosen crop/hotspot).

## Architecture

```
Sanity Studio  ──edits──▶  Sanity Content Lake (GROQ API)
                                   │
                                   ▼
                  Hydrogen loader (context.sanity.query)
                                   │
                                   ▼
                   SectionRenderer ──▶ React components
```

- **Content source:** Sanity. Schemas live in `studio/schemaTypes/`.
- **Consumer:** Hydrogen. The Sanity client is attached to the app context
  (`app/lib/sanity.ts`, wired in `app/lib/context.ts`), so any loader can call
  `context.sanity.query(...)`.
- **Querying:** GROQ via the official `hydrogen-sanity` toolkit. (See the journal
  for why GROQ over GraphQL.)
- **Rendering:** `app/components/SectionRenderer.tsx` is the single source of
  truth for the section-type → component mapping, shared by every route.

## Running locally

Requires Node 20+ (developed on 22).

**1. Hydrogen storefront** (from the repo root):

```bash
npm install
npm run dev          # http://localhost:3000  (uses Mock.shop sample data)
```

**2. Sanity Studio** (in a second terminal):

```bash
cd studio
npm install
npm run dev          # http://localhost:3333
```

Log into the Studio, create/edit a Home Page or Page document, **publish**, and
the changes appear in Hydrogen.

## Environment

Hydrogen reads two non-secret values (safe to expose; they identify a public
dataset):

```
PUBLIC_SANITY_PROJECT_ID="dlreamui"
PUBLIC_SANITY_DATASET="production"
```

A `.env.example` template is committed; the real `.env` is gitignored. There is
no Sanity write token in the project — consumption is read-only.

## Notes / decisions

The reasoning behind the choices here — GROQ vs GraphQL, the standalone image
builder vs the toolkit hook, the CSP allowlist for Sanity's CDN, route-collision
debugging, and known next steps (TypeGen for typed content, Visual Editing for
live preview) — is documented as I went in **[JOURNAL.md](./JOURNAL.md)**.
