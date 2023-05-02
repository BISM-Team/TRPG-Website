import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";
import { getModifiablePages, getViewablePages } from "$lib/db/page.server";
import { getLoginOrRedirect } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, params, url }) => {
  const user = getLoginOrRedirect(locals, url);
  const campaign = await getUserCampaignWithGmInfo(user, params.campaign);
  const modifiable = url.searchParams.get("modifiable");

  if (!campaign) throw error(400, "Campaign not existing or not accessible");

  const result = modifiable
    ? await getModifiablePages(user, campaign)
    : await getViewablePages(user, campaign);

  return json(result);
};
