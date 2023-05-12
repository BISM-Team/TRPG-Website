import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";
import { getModifiablePages, getViewablePages } from "$lib/db/page.server";
import { getLoginOrRedirect } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST = async function (event) {
  const { locals, url, params } = event;
  const user = getLoginOrRedirect(locals, url);
  const campaign = await getUserCampaignWithGmInfo(user, params.campaign);

  if (!campaign) throw error(400);

  const result = url.searchParams.get("modifiable")
    ? await getModifiablePages(user, campaign)
    : await getViewablePages(user, campaign);

  return json({
    pages: result,
  });
} satisfies RequestHandler;

export const PUT = async function ({ locals, url, params, fetch }) {
  const user = getLoginOrRedirect(locals, url);
  const campaign = await getUserCampaignWithGmInfo(user, params.campaign);

  fetch("/api/Campaign");
  if (!campaign) throw error(400);

  const result = url.searchParams.get("modifiable")
    ? await getModifiablePages(user, campaign)
    : await getViewablePages(user, campaign);

  return json({
    pages: true,
  });
} satisfies RequestHandler;
