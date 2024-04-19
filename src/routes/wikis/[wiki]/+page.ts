import { propagateErrors } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, params, url }) => {
  const response = await fetch(`/api/wikis/${params.wiki}`);
  await propagateErrors(response, url);
  if (!response.ok) throw new Error('unexpected error');
  const data = await response.json();
  if (!data.wiki) error(404);

  return {
    wiki: data.wiki,
    params
  };
}) satisfies PageLoad;
