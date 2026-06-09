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
- [x] **Stage 4 — Portable Text + second page type.** Rich content rendered through my own components; add the second page; handle Sanity images.
- [ ] **Stage 5 (stretch) — Visual editing / live preview.** Click-to-edit overlays if time allows, without risking the working core.
- [ ] **Stage 6 — Polish.** README, clean from-scratch run, rehearse the demo.

---

## Open Questions / Things to Resolve

**Question 1 — GraphQL vs GROQ for consumption.** The brief mentions GraphQL on the Sanity side. First read of the official `hydrogen-sanity` toolkit suggests GROQ is the default/recommended path, with GraphQL also supported. Need to confirm the tradeoff and pick one deliberately. _(Revisit in Stage 3.)_

-> Decision: I evaluated GraphQL vs GROQ, and chose GROQ because it's what the official toolkit is built around — its caching and preview integration all assume it, so GraphQL would mean fighting the tooling for no gain on content this simple

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
5. Two things are intentionally unfinished

- The rich text shows [Portable Text renders in the next step] because Portable Text isn't a string — it's structured blocks that need a dedicated renderer (@portabletext/react). Rendering it naively would've coupled two new things in one step. I proved the pipeline first; the renderer is next
- The featured section shows Handles: snowboard — just the raw handle, not a product card. Sanity owns which products to feature; actually looking those handles up against the Storefront API to show price/image is a separate step.
- the any type: I typed home as any to get the data flowing. I typed it loosely to verify the pipeline, then I'd generate proper types — Sanity has TypeGen that produces TypeScript types from your GROQ queries, so the content is typed end to end.

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

Edit 1: Add the GROQ query constant

```bash
const HOME_QUERY = `*[_type == "homePage"][0]{
  title,
  sections[]{
    _type,
    _key,
    heading,
    subheading,
    ctaLabel,
    ctaHref,
    body,
    productHandles
  }
}`;
```

Edit 2 — Fetch it in loadCriticalData

```bash
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}, home] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.sanity.query(HOME_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0],
    home,
  };
}
```

Edit 3 — Render the sections in the component

```bash
export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <HomeSections home={data.home} />
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function HomeSections({home}: {home: any}) {
  if (!home?.sections?.length) {
    return <p>No home page content found in Sanity.</p>;
  }
  return (
    <div className="home-sections">
      {home.sections.map((section: any) => {
        switch (section._type) {
          case 'heroSection':
            return (
              <section key={section._key} className="section-hero">
                <h1>{section.heading}</h1>
                {section.subheading ? <p>{section.subheading}</p> : null}
                {section.ctaLabel ? (
                  <Link to={section.ctaHref || '#'}>{section.ctaLabel}</Link>
                ) : null}
              </section>
            );
          case 'richTextSection':
            return (
              <section key={section._key} className="section-richtext">
                {section.heading ? <h2>{section.heading}</h2> : null}
                <p>[Portable Text renders in the next step]</p>
              </section>
            );
          case 'featuredProductsSection':
            return (
              <section key={section._key} className="section-featured">
                {section.heading ? <h2>{section.heading}</h2> : null}
                <p>Handles: {(section.productHandles || []).join(', ')}</p>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
```

### [Jun 6] — Stage 4

1.

```bash
cd ~/hydrogen-sanity-homepage
npm install @portabletext/react
```

2. Create PortableTextRender.tsx

```bash
import {PortableText, type PortableTextComponents} from '@portabletext/react';
import {Link} from 'react-router';

/**
 * Custom rendering map for Portable Text.
 *
 * Portable Text stores rich text as structured blocks, not HTML. This object
 * tells the renderer how to turn each piece into React. We only override what
 * we care about — everything else falls back to sensible defaults.
 *
 * The interesting one is the `link` mark: instead of a plain <a>, an internal
 * link renders react-router's <Link> for client-side navigation. This is the
 * point of structured content — the editor writes a link, the developer decides
 * how links behave.
 */
const components: PortableTextComponents = {
  block: {
    h2: ({children}) => <h2 className="pt-h2">{children}</h2>,
    h3: ({children}) => <h3 className="pt-h3">{children}</h3>,
    blockquote: ({children}) => (
      <blockquote className="pt-quote">{children}</blockquote>
    ),
    normal: ({children}) => <p className="pt-p">{children}</p>,
  },
  marks: {
    strong: ({children}) => <strong>{children}</strong>,
    em: ({children}) => <em>{children}</em>,
    link: ({value, children}) => {
      const href = value?.href || '#';
      const isInternal = href.startsWith('/');
      return isInternal ? (
        <Link to={href}>{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({children}) => <ul className="pt-ul">{children}</ul>,
    number: ({children}) => <ol className="pt-ol">{children}</ol>,
  },
};

export function PortableTextRenderer({value}: {value: any}) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
```

3. Edit 1 — import it at the top with the other component imports to app/routes/\_index.tsx:

```bash
import {PortableTextRenderer} from '~/components/PortableTextRenderer';
```

4. Edit 2 — replace the rich-text placeholder in the switch. Find the richTextSection case and swap the placeholder line:

```bash
case 'richTextSection':
            return (
              <section key={section._key} className="section-richtext">
                {section.heading ? <h2>{section.heading}</h2> : null}
                <PortableTextRenderer value={section.body} />
              </section>
            );
```

Bullet list rendered structurally correct but markers were invisible — Tailwind's preflight reset sets list-style: none. Added explicit list styling. Reinforced the core idea: Portable Text owns structure, the consuming app owns presentation.

```bash
.pt-ul { list-style: disc; padding-left: 1.5rem; }
.pt-ol { list-style: decimal; padding-left: 1.5rem; }
```

\*\*\*About Page

1. Edit the route file app/routes/pages.$handle.tsx

```bash
import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {PortableTextRenderer} from '~/components/PortableTextRenderer';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: data?.page?.title ? `${data.page.title} | Luxome` : 'Luxome'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

/**
 * Critical data: the Sanity page matching the URL handle. The route param is
 * named `handle` (this is the scaffold's CMS-page route, repurposed for Sanity),
 * and we bind it to the GROQ query's $slug parameter.
 */
async function loadCriticalData({context, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const page = await context.sanity.query(PAGE_QUERY, {slug: params.handle});

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return {page};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <div className="page">
      <header>
        <h1>{page.title}</h1>
      </header>
      <PageSections sections={page.sections} />
    </div>
  );
}

function PageSections({sections}: {sections: any}) {
  if (!sections?.length) {
    return <p>This page has no content yet.</p>;
  }
  return (
    <div className="page-sections">
      {sections.map((section: any) => {
        switch (section._type) {
          case 'heroSection':
            return (
              <section key={section._key} className="section-hero">
                <h2>{section.heading}</h2>
                {section.subheading ? <p>{section.subheading}</p> : null}
                {section.ctaLabel ? (
                  <Link to={section.ctaHref || '#'}>{section.ctaLabel}</Link>
                ) : null}
              </section>
            );
          case 'richTextSection':
            return (
              <section key={section._key} className="section-richtext">
                {section.heading ? <h2>{section.heading}</h2> : null}
                <PortableTextRenderer value={section.body} />
              </section>
            );
          case 'featuredProductsSection':
            return (
              <section key={section._key} className="section-featured">
                {section.heading ? <h2>{section.heading}</h2> : null}
                <p>Handles: {(section.productHandles || []).join(', ')}</p>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  sections[]{
    _type,
    _key,
    heading,
    subheading,
    ctaLabel,
    ctaHref,
    body,
    productHandles
  }
}`;

```

- Dropped the Shopify-specific redirectIfHandleIsLocalized call when repurposing the route for Sanity — it handles Shopify handle localization, irrelevant to Sanity-sourced pages.
