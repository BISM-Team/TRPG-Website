import { getCampaign } from '$lib/db/campaigns.server';
import { getLogin } from '$lib/utils.server';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = async function ({ locals, params }) {
  const user = getLogin(locals);
  const campaign = await getCampaign(user.id, params.campaign);
  if (!campaign) error(404, 'Campaign not found');

  return json({ campaign });
} satisfies RequestHandler;

