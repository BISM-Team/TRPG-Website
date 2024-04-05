import { propagateErrors } from '$lib/utils';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch, url }) => {
  const response = await fetch(`/api/campaigns/${params.campaign}`);
  await propagateErrors(response, url);
  if (!response.ok) throw new Error('unexpected error');
  return { campaign: (await response.json()).campaign, params };
}) satisfies PageLoad;

