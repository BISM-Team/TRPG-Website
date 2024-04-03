import { getUserCampaign } from "$lib/db/campaign.server";
import { getLogin } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "../$types";
import { getUserDashboards } from "$lib/db/dashboard.server";

export const GET = async function ({ locals, params }) {
  const user = getLogin(locals);
  if (!(await getUserCampaign(user.id, params.campaign)))
    error(404, "Campaign not found");
  return json({
    dashboards: await getUserDashboards(user.id, params.campaign),
  });
} satisfies RequestHandler;
