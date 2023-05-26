import { getUserDashboardTemplates } from "$lib/db/dashboard_template.server";
import { getLogin } from "$lib/utils.server";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Type } from "@prisma/client";

export const GET = async function ({ locals, url }) {
  const user = getLogin(locals);
  const query = url.searchParams;
  const _type = query.get("type");
  const type =
    _type && Object.keys(Type).includes(_type) ? (_type as Type) : undefined;
  const templates = await getUserDashboardTemplates(user.id, type);
  return json(templates);
} satisfies RequestHandler;
