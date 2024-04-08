import { getCharacter } from '$lib/db/characters.server';
import { getLogin } from '$lib/utils.server';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = async function ({ locals, params }) {
  const user = getLogin(locals);

  const character = await getCharacter(user.id, params.character);
  if (!character) error(404, 'character not found');
  return json({ character });
} satisfies RequestHandler;

