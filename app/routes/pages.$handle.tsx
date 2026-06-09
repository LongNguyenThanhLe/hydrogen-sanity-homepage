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
