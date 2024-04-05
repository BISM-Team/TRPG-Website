import { propagateErrors, replaceCardSource } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, params, url }) => {
  const response = await fetch(`/api/characters/${params.character}`);
  await propagateErrors(response, url);
  if (!response.ok) throw new Error('unexpected error');
  const data = await response.json();
  if (!data.character) error(404);

  return {
    character: data.character,
    params
  };
}) satisfies PageLoad;

