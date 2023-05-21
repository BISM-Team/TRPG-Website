import type { RequestEvent } from "./$types";
import { getLogin } from "$lib/utils.server";
import { getUserCampaigns } from "$lib/db/campaign.server";
import { json } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
  const { locals, url } = event;
  const user = getLogin(locals);
  const campaigns = await getUserCampaigns(user.id);
  return json({
    campaigns,
  });
}
