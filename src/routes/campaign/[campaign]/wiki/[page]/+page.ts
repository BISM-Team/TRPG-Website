import { renderTree } from "$lib/WorldWiki/tree/tree";
import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";

const fetchCampaign = async function ({ fetch, params, url }) {
  const campaign_response = await fetch(`/api/campaign/${params.campaign}`);
  await propagateErrors(campaign_response, url);
  if (!campaign_response.ok) throw new Error("unexpected error");
  return await campaign_response.json();
} satisfies PageLoad;

export const load: PageLoad = async (event) => {
  const { params, fetch, url } = event;
  const page_response = await fetch(
    `/api/campaign/${params.campaign}/wiki/${params.page}`
  );
  await propagateErrors(page_response, url);
  if (!page_response.ok) throw new Error("unexpected error");
  const data = await page_response.json();

  return {
    ...data,
    campaign: fetchCampaign(event),
    renderedTree: renderTree(
      JSON.parse(JSON.stringify(data.tree)),
      data.user_id,
      data.gm_id
    ),
  };
};
