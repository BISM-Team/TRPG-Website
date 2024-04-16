import { getWikisToAdd } from '$lib/db/wikis.server';
import { getLogin } from '$lib/utils.server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const GET = async function ({ locals, url }) {
  const user = getLogin(locals);

  const campaignId = url.searchParams.get('campaignId');

  if (!campaignId) error(400, 'Missing "campaignId" in search params');

  const wikis = await getWikisToAdd(user.id, campaignId);
  return json({ wikis });
} satisfies RequestHandler;

