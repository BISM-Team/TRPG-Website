import type { PageServerLoad } from "./$types";
import {
  createCard,
  getDashboard,
  removeCard,
  updateCards,
} from "$lib/db/dashboard.server";
import { error, type Actions, fail } from "@sveltejs/kit";
import { getLoginOrRedirect } from "$lib/utils.server";
import { parse } from "devalue";
import type { CardData } from "@prisma/client";

export const load = (async ({ locals, params }) => {
  const user = getLoginOrRedirect(locals);
  const dashboard = await getDashboard(user, params.campaign, params.dashboard);
  if (!dashboard) throw error(404, "Dashboard not found");
  return { dashboard: dashboard };
}) satisfies PageServerLoad;

export const actions: Actions = {
  save: async function ({ request, locals }) {
    const user = getLoginOrRedirect(locals);

    const data = await request.formData();
    const _cards = data.get("cards");
    const dashboardId = data.get("dashboardId")?.toString();

    if (!_cards || !dashboardId)
      return fail(400, { save_error: true, invalid_data: false });
    const cards: CardData[] = parse(_cards.toString());

    try {
      await updateCards(user, dashboardId, cards);
    } catch (exc) {
      console.error(exc);
      return fail(500, { save_error: true, server_error: true });
    }
  },

  createCard: async function ({ request, locals }) {
    const user = getLoginOrRedirect(locals);

    const data = await request.formData();
    const index = data.get("index")?.toString();
    const width = data.get("width")?.toString();
    const height = data.get("height")?.toString();
    const zoom = data.get("zoom")?.toString();
    const source = data.get("source")?.toString();
    const type = data.get("type")?.toString();
    const dashboardId = data.get("dashboardId")?.toString();

    const saved_card = {
      index: index,
      width: width,
      height: height,
      zoom: zoom,
      source: source,
      type: type,
    };

    if (
      !index ||
      !width ||
      !height ||
      !zoom ||
      !source ||
      !type ||
      !dashboardId
    )
      return fail(400, {
        ...saved_card,
        create_error: true,
        missing_fields: true,
      });

    try {
      return {
        dashboard: await createCard(user, dashboardId, {
          index: parseInt(index),
          width: parseInt(width),
          height: parseInt(height),
          zoom: parseInt(zoom),
          source: source,
          type: type,
        }),
      };
    } catch (exc) {
      console.error(exc);
      return fail(500, {
        ...saved_card,
        create_error: true,
        server_error: true,
      });
    }
  },

  removeCard: async function ({ request, locals }) {
    const user = getLoginOrRedirect(locals);

    const data = await request.formData();
    const cardId = data.get("cardId")?.toString();
    const dashboardId = data.get("dashboardId")?.toString();

    if (!cardId || !dashboardId)
      return fail(400, { remove_error: true, invalid_data: true });

    try {
      return {
        dashboard: await removeCard(user, dashboardId, cardId),
      };
    } catch (exc) {
      console.error(exc);
      return fail(500, { remove_error: true });
    }
  },
};
