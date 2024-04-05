import {
  getCharacters,
  getCharactersInCampaign,
  getCharactersNotInCampaign
} from '$lib/db/characters.server';
import { getLogin } from '$lib/utils.server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = async function ({ locals, url }) {
  const user = getLogin(locals);

  const query = url.searchParams;
  const campaignId = query.get('campaignId');

  let characters: Awaited<ReturnType<typeof getCharacters>>;

  if (campaignId) {
    const not_in = query.get('not_in') && query.get('not_in') === 'true' ? true : false;

    characters = not_in
      ? await getCharactersNotInCampaign(user.id, campaignId)
      : await getCharactersInCampaign(user.id, campaignId);
  } else {
    characters = await getCharacters(user.id);
  }
  return json({ characters });
} satisfies RequestHandler;

