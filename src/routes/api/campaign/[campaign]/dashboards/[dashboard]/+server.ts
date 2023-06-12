import { getDashboard } from "$lib/db/dashboard.server";
import { getLogin } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ locals, params }) {
  const user = getLogin(locals);
  const dashboard = await getDashboard(
    user.id,
    params.dashboard,
    params.campaign
  );
  if (!dashboard) throw error(404, "Dashboard not found");
  return json({ dashboard: dashboard });
} satisfies RequestHandler;
