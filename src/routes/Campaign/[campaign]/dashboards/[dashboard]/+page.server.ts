import { updateCards } from "$lib/db/dashboard.server";
import { type Actions, fail } from "@sveltejs/kit";
import { getLogin } from "$lib/utils.server";
import { parse } from "devalue";
import type { CardData } from "@prisma/client";

export const actions: Actions = {
  save: async function ({ request, locals }) {
    const user = getLogin(locals);

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
