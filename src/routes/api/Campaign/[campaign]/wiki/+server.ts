import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";
import { getModifiablePages, getViewablePages } from "$lib/db/page.server";
import { getLoginOrRedirect } from "$lib/utils.server";
import { BadRequest, Ok } from "sveltekit-zero-api/http";
import type { RequestEvent } from "./$types";
import { querySpread, type KitEvent } from "sveltekit-zero-api";

interface Get {
  query: {
    modifiable: boolean;
  };
}

export async function GET(event: KitEvent<Get, RequestEvent>) {
  const { locals, params, url } = event;
  const { modifiable } = querySpread(event);
  const user = getLoginOrRedirect(locals, url);
  const campaign = await getUserCampaignWithGmInfo(user, params.campaign);

  if (!campaign) return BadRequest();

  const result = modifiable
    ? await getModifiablePages(user, campaign)
    : await getViewablePages(user, campaign);

  return Ok({
    body: {
      pages: result,
    },
  });
}
