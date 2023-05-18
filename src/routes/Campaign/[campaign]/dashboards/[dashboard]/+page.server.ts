import type { PageServerLoad } from "./$types";
import { getDashboard, updateCards } from "$lib/db/dashboard.server";
import { error, type Actions, fail } from "@sveltejs/kit";
import { getLogin } from "$lib/utils.server";
import { parse } from "devalue";
import type { CardData } from "@prisma/client";

export const load = (async ({ locals, params, url }) => {
  const user = getLogin(locals, url);
  const dashboard = await getDashboard(
    user.id,
    params.campaign,
    params.dashboard
  );
  if (!dashboard) throw error(404, "Dashboard not found");
  return { dashboard: dashboard };
}) satisfies PageServerLoad;

export const actions: Actions = {
  save: async function ({ request, locals, url }) {
    const user = getLogin(locals, url);

    const data = await request.formData();
    const _cards = data.get("cards");
    const _removed = data.get("removed");
    const dashboardId = data.get("dashboardId")?.toString();

    if (!_cards || !_removed || !dashboardId)
      return fail(400, { save_error: true, invalid_data: false });

    const cards: CardData[] = parse(_cards.toString());
    const removed: string[] = parse(_removed.toString());

    try {
      await updateCards(user.id, dashboardId, cards, removed);
    } catch (exc) {
      console.error(exc);
      return fail(500, { save_error: true, server_error: true });
    }
  },
};
