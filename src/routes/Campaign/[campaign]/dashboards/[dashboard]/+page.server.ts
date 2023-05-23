import {
  deleteDashboard,
  getDashboard,
  updateCards,
} from "$lib/db/dashboard.server";
import { fail } from "@sveltejs/kit";
import { getLogin } from "$lib/utils.server";
import { parse } from "devalue";
import type { CardData } from "@prisma/client";
import type { Actions } from "./$types";
import {
  getDashboardTemplate,
  loadTemplateToDashboard,
  saveDashboardToTemplate,
} from "$lib/db/dashboard_template.server";

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

  delete: async function ({ locals, params }) {
    const user = getLogin(locals);

    try {
      await deleteDashboard(user.id, params.campaign, params.dashboard);
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
    }
  },

  loadFromTemplate: async function ({ locals, request, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const templateId = data.get("templateId")?.toString() || "";
    const options_numVar = Boolean(data.get("options_numVar") ?? "true");
    const options_strVar = Boolean(data.get("options_strVar") ?? "true");
    const options_cards = Boolean(data.get("options_cards") ?? "true");
    const template = await getDashboardTemplate(user.id, templateId);

    if (!template) return fail(400, { template_non_existant: true });

    try {
      await loadTemplateToDashboard(
        user.id,
        params.campaign,
        params.dashboard,
        template,
        {
          numericVariables: options_numVar,
          stringVariables: options_strVar,
          cards: options_cards,
        }
      );
    } catch (exc) {
      console.error(exc);
      return fail(500, { templateId, server_error: true });
    }
  },

  saveToTemplate: async function ({ locals, request, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get("name")?.toString();
    const templateId = data.get("templateId")?.toString();
    const options_numVar = Boolean(data.get("options_numVar") ?? "true");
    const options_strVar = Boolean(data.get("options_strVar") ?? "true");
    const options_cards = Boolean(data.get("options_cards") ?? "true");
    const dashboard = await getDashboard(
      user.id,
      params.campaign,
      params.dashboard
    );

    if (!name) return fail(400, { name, templateId, name_missing: true });
    if (!dashboard)
      return fail(400, { name, templateId, dashboard_non_existant: true });

    try {
      await saveDashboardToTemplate(user.id, name, templateId, dashboard, {
        numericVariables: options_numVar,
        stringVariables: options_strVar,
        cards: options_cards,
      });
    } catch (exc) {
      console.error(exc);
      return fail(500, { name, templateId, server_error: true });
    }
  },
};
