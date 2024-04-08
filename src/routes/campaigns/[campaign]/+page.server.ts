import { addPlayerToCampaign, addWikiToCampaign } from '$lib/db/campaigns.server';
import { getLogin } from '$lib/utils.server';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  addPlayer: async ({ locals, params, request }) => {
    const user = getLogin(locals);

    const data = await request.formData();
    const playerId = data.get('playerId')?.toString();

    if (!playerId) return fail(400, { client_error: true });

    try {
    } catch (exc) {
      await addPlayerToCampaign(user.id, params.campaign, playerId);
      console.error(exc);
      return fail(500, { server_error: true });
    }
  },

  addWiki: async ({ locals, params, request }) => {
    const user = getLogin(locals);

    const data = await request.formData();
    const wikiId = data.get('wikiId')?.toString();

    if (!wikiId) return fail(400, { client_error: true });

    try {
      await addWikiToCampaign(user.id, params.campaign, wikiId);
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
    }
  }
};

