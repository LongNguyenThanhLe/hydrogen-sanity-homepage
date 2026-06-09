import {Link} from 'react-router';
import {PortableTextRenderer} from '~/components/PortableTextRenderer';

/**
 * Renders an array of Sanity page sections.
 *
 * This is the single source of truth for the section-type -> component mapping,
 * shared by every route that renders Sanity page content (home page, dynamic
 * pages). Adding a new section type means adding one case here, and every page
 * picks it up. Previously this switch was duplicated per route — consolidated
 * so the two can't drift apart.
 */

type Section = {
  _type: string;
  _key: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  body?: any;
  productHandles?: string[];
};

function HeroSection({section}: {section: Section}) {
  return (
    <section className="section-hero">
      <h2>{section.heading}</h2>
      {section.subheading ? <p>{section.subheading}</p> : null}
      {section.ctaLabel ? (
        <Link to={section.ctaHref || '#'}>{section.ctaLabel}</Link>
      ) : null}
    </section>
  );
}

function RichTextSection({section}: {section: Section}) {
  return (
    <section className="section-richtext">
      {section.heading ? <h2>{section.heading}</h2> : null}
      <PortableTextRenderer value={section.body} />
    </section>
  );
}

function FeaturedProductsSection({section}: {section: Section}) {
  return (
    <section className="section-featured">
      {section.heading ? <h2>{section.heading}</h2> : null}
      <p>Handles: {(section.productHandles || []).join(', ')}</p>
    </section>
  );
}

export function SectionRenderer({sections}: {sections?: Section[]}) {
  if (!sections?.length) {
    return <p>No content yet.</p>;
  }

  return (
    <div className="sections">
      {sections.map((section) => {
        switch (section._type) {
          case 'heroSection':
            return <HeroSection key={section._key} section={section} />;
          case 'richTextSection':
            return <RichTextSection key={section._key} section={section} />;
          case 'featuredProductsSection':
            return (
              <FeaturedProductsSection key={section._key} section={section} />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
