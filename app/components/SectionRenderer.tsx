import {Link} from 'react-router';
import {urlForImage} from '~/lib/image';
import {PortableTextRenderer} from '~/components/PortableTextRenderer';

/**
 * Renders an array of Sanity page sections. Single source of truth for the
 * section-type -> component mapping, shared by every route rendering Sanity
 * page content (home + dynamic pages).
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
  backgroundImage?: any;
};

function HeroSection({section}: {section: Section}) {
  // useImageUrl builds an optimized CDN URL from the Sanity image reference.
  // We request a fixed width and auto format so the CDN serves an appropriately
  // sized, modern-format image rather than the original upload. Hotspot/crop
  // chosen by the editor are respected automatically.
  const bgUrl = section.backgroundImage
    ? urlForImage(section.backgroundImage).width(1600).auto('format').url()
    : null;

  return (
    <section
      className="section-hero"
      style={
        bgUrl
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${bgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              padding: '4rem 2rem',
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }
          : undefined
      }
    >
      <h2>{section.heading}</h2>
      {section.subheading ? <p>{section.subheading}</p> : null}
      {section.ctaLabel ? (
        <Link
          to={section.ctaHref || '#'}
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            width: 'fit-content',
          }}
        >
          {section.ctaLabel}
        </Link>
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
