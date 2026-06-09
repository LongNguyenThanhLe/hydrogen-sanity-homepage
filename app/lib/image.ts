import imageUrlBuilder from '@sanity/image-url';
import type {SanityImageSource} from '@sanity/image-url/lib/types/types';

// projectId/dataset are not secrets (public dataset), so they're safe inline.
// Reading import.meta.env was unreliable in the Oxygen server context, so we
// source these directly — they match studio/sanity.config.ts.
const builder = imageUrlBuilder({
  projectId: 'dlreamui',
  dataset: 'production',
});

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
