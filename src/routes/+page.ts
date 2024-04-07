import type { TypedResponseFromPath } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { ValidMethod } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

async function fetchArrayOrEmpty<
  Fetch extends Function,
  T extends string,
  F extends keyof Awaited<ReturnType<TypedResponseFromPath<T, 'GET' & ValidMethod<T>>['json']>>
>(
  fetch: Fetch,
  path: T,
  field: F
): Promise<Awaited<ReturnType<TypedResponseFromPath<T, 'GET' & ValidMethod<T>>['json']>>[F]> {
  const response = await fetch(path);
  if (!response.ok)
    if (response.status === 401) return [];
    else error(response.status);
  else return (await response.json())[field];
}

export const load = (async ({ fetch }) => {
  return {
    campaigns: fetchArrayOrEmpty(fetch, '/api/campaigns', 'campaigns'),
    characters: fetchArrayOrEmpty(fetch, '/api/characters', 'characters'),
    wikis: fetchArrayOrEmpty(fetch, '/api/wikis', 'wikis')
  };
}) satisfies PageLoad;

