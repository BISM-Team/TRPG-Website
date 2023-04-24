import type { PageServerLoad } from "./$types";
import { createCard, getDashboard, removeCard } from "$lib/db/dashboard.server";
import { error, type Actions, fail } from "@sveltejs/kit";
import { getLoginOrRedirect } from "$lib/utils.server";

export const load = (async ({ locals, params }) => {
  const user = getLoginOrRedirect(locals);
  const dashboard = await getDashboard(user, params.campaign, params.dashboard);
  if (!dashboard) throw error(404, "Dashboard not found");
  return { dashboard: dashboard };
}) satisfies PageServerLoad;

export const actions: Actions = {
  createCard: async function ({ request, locals }) {
    const user = getLoginOrRedirect(locals);

    const data = await request.formData();
    const width = data.get("width")?.toString();
    const height = data.get("height")?.toString();
    const zoom = data.get("zoom")?.toString();
    const source = data.get("source")?.toString();
    const type = data.get("type")?.toString();
    const dashboardId = data.get("dashboardId")?.toString();

    const saved_card = {
      width: width,
      height: height,
      zoom: zoom,
      source: source,
      type: type,
    };

    if (!width || !height || !zoom || !source || !type || !dashboardId)
      return fail(400, { ...saved_card, missing_fields: true });

    try {
      return {
        dashboard: await createCard(user, dashboardId, {
          width: parseInt(width),
          height: parseInt(height),
          zoom: parseInt(zoom),
          source: source,
          type: type,
        }),
      };
    } catch (exc) {
      console.error(exc);
      return fail(500, { ...saved_card, server_error: true });
    }
  },

  removeCard: async function ({ request, locals }) {
    const user = getLoginOrRedirect(locals);

    const data = await request.formData();
    const cardId = data.get("cardId")?.toString();
    const dashboardId = data.get("dashboardId")?.toString();

    if (!cardId || !dashboardId) return fail(400, { missing_fields: true });

    try {
      return {
        dashboard: await removeCard(user, dashboardId, cardId),
      };
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
    }
  },
};
