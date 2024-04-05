import { getCampaigns } from '$lib/db/campaigns.server';
import { getCharacters } from '$lib/db/characters.server';
import { getWikis } from '$lib/db/wikis.server';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  if (locals.user) {
    return {
      campaigns: getCampaigns(locals.user.id),
      characters: getCharacters(locals.user.id),
      wikis: getWikis(locals.user.id)
    };
  } else {
    return {
      campaigns: [],
      characters: [],
      wikis: []
    };
  }
}) satisfies PageServerLoad;

