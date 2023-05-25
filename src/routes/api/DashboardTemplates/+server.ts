import { getUserDashboardTemplates } from "$lib/db/dashboard_template.server";
import { getLogin } from "$lib/utils.server";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ locals, url }) {
  const user = getLogin(locals);
  const templates = await getUserDashboardTemplates(user.id);
  return json(templates);
} satisfies RequestHandler;
