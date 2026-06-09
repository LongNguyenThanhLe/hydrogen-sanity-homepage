import {createSanityContext} from 'hydrogen-sanity';

/**
 * Creates the Sanity context attached to Hydrogen's app context.
 * Exposes `context.sanity.query(...)` inside loaders/actions.
 *
 * Note: createSanityContext is async in hydrogen-sanity v5 (breaking change
 * from v4). It takes `request` and `cache`, and the client config nested
 * under `client`.
 */
export async function createSanityClient(
  request: Request,
  env: Env,
  cache: Cache,
) {
  return createSanityContext({
    request,
    cache,
    client: {
      projectId: env.PUBLIC_SANITY_PROJECT_ID,
      dataset: env.PUBLIC_SANITY_DATASET,
      apiVersion: '2024-01-01',
      useCdn: false,
    },
  });
}
