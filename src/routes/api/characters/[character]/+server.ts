import { getCharacter } from '$lib/db/characters.server';
import { getLogin } from '$lib/utils.server';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = async function ({ locals, params, url }) {
  const user = getLogin(locals);

  const query = url.searchParams;
  const campaignId = query.get('campaignId') ?? undefined;

  const character = await getCharacter(user.id, params.character, campaignId);
  if (!character) error(404, 'character not found');
  return json({ character });
} satisfies RequestHandler;

