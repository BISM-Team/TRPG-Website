import type { RequestEvent } from "./$types";
import { getLoginOrRedirect } from "$lib/utils.server";
import { getUserCampaigns } from "$lib/db/campaign.server";
import { json } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
  const { locals, url } = event;
  const user = getLoginOrRedirect(locals, url);
  const campaigns = await getUserCampaigns(user.id);
  return json({
    campaigns,
  });
}