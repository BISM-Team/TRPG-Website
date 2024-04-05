import type { RequestHandler } from './$types';
import { getLogin } from '$lib/utils.server';
import { getCampaigns } from '$lib/db/campaigns.server';
import { json } from '@sveltejs/kit';

export const GET = async function (event) {
  const { locals, url } = event;
  const user = getLogin(locals);
  const campaigns = await getCampaigns(user.id);
  return json({ campaigns });
} satisfies RequestHandler;

