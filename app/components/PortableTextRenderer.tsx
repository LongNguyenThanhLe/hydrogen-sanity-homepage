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
