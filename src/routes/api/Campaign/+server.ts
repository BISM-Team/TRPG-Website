import type { RequestEvent } from "./$types";
import { getLoginOrRedirect } from "$lib/utils.server";
import { getUserCampaigns } from "$lib/db/campaign.server";
import { json } from "@sveltejs/kit";
import type { TypedJson } from "../../../../$api";

export async function GET(event: RequestEvent) {
  const { locals, url } = event;
  const user = getLoginOrRedirect(locals, url);
  const campaigns = await getUserCampaigns(user);
  return json({
    campaigns,
  });
}
