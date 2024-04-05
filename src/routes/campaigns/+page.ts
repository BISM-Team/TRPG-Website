import type { PageLoad } from './$types';
import { propagateErrors } from '$lib/utils';

export const load: PageLoad = async ({ fetch, url }) => {
  const response = await fetch('/api/campaigns');
  await propagateErrors(response, url);
  if (!response.ok) throw new Error('unexpected error');
  return { campaigns: (await response.json()).campaigns };
};

