import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";
import { getLogin } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

function filterNode(
  user_id: string,
  gm_id: string,
  node: PrismaJson.WikiTreeNode,
  modifiable: boolean
) {
  if (
    user_id !== gm_id &&
    !(modifiable ? node.modifiers : node.viewers).includes("all") &&
    !(modifiable ? node.modifiers : node.viewers).includes(user_id)
  )
    return false;

  node.children = node.children.filter((child) => {
    return filterNode(user_id, gm_id, child, modifiable);
  });
  return true;
}

export const GET = async function ({ locals, params, url }) {
  const user = getLogin(locals);
  const campaign = await getUserCampaignWithGmInfo(user.id, params.campaign);
  if (!campaign) error(404, "Campaign not found");

  const modifiable =
    url.searchParams.get("modifiable")?.toLowerCase() === "true";
  filterNode(
    user.id,
    campaign.Campaign_User[0].userId,
    campaign.wikiTree,
    modifiable
  );
  return json(campaign);
} satisfies RequestHandler;
