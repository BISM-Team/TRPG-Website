import { getWikis } from '$lib/db/wikis.server';
import { getLogin } from '$lib/utils.server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = async function ({ locals }) {
  const user = getLogin(locals);
  const wikis = await getWikis(user.id);
  return json({ wikis });
} satisfies RequestHandler;

