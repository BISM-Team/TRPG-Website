import { getUserCampaign } from "$lib/db/campaign.server";
import { getLoginOrRedirect } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getUserDashboards } from "$lib/db/dashboard.server";

export const GET = async function ({ locals, params, url }) {
  const user = getLoginOrRedirect(locals, url);
  if (!(await getUserCampaign(user.id, params.campaign)))
    throw error(404, "Campaign not found");
  return json({
    dashboards: await getUserDashboards(user.id, params.campaign),
  });
} satisfies RequestHandler;
