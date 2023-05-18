import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";
import { getModifiablePages, getViewablePages } from "$lib/db/page.server";
import { getLogin } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ locals, url, params }) {
  const user = getLogin(locals, url);
  const campaign = await getUserCampaignWithGmInfo(user.id, params.campaign);

  if (!campaign) throw error(400);

  const result = url.searchParams.get("modifiable")
    ? await getModifiablePages(user.id, campaign)
    : await getViewablePages(user.id, campaign);

  return json({
    pages: result,
  });
} satisfies RequestHandler;
