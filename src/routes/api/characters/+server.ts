import { getCharacters } from '$lib/db/characters.server';
import { getLogin } from '$lib/utils.server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = async function ({ locals }) {
  const user = getLogin(locals);

  const characters = await getCharacters(user.id);
  return json({ characters });
} satisfies RequestHandler;

