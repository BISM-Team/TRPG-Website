import { getUserCampaign } from "$lib/db/campaign.server";
import { getLogin } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ locals, params }) {
  const user = getLogin(locals);
  const campaign = await getUserCampaign(user.id, params.campaign);
  if (!campaign) throw error(404, "Campaign not found");
  return json(campaign);
} satisfies RequestHandler;
