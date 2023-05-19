import { getDashboard } from "$lib/db/dashboard.server";
import { getLogin } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ locals, url, params }) {
  const user = getLogin(locals, url);
  const dashboard = await getDashboard(
    user.id,
    params.campaign,
    params.dashboard
  );
  if (!dashboard) throw error(404, "Dashboard not found");
  return json({ dashboard: dashboard });
} satisfies RequestHandler;
