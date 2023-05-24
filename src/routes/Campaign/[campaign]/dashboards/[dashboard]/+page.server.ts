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
  save: async function ({ request, locals, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const _cards = data.get("cards");
    const _removed = data.get("removed");
    if (!_cards || !_removed || !params.dashboard)
      return fail(400, { save_invalid_data: true });

    const cards: CardData[] = parse(_cards.toString());
    const removed: string[] = parse(_removed.toString());

    try {
      await updateCards(user.id, params.dashboard, cards, removed);
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
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

    if (!template) return fail(400, { load_from_template_non_existant: true });

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
      return fail(500, {
        load_from_templateId: templateId,
        server_error: true,
      });
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

    const _cards = data.get("cards");
    const _removed = data.get("removed");

    if (!_cards || !_removed || !params.dashboard)
      return fail(400, { invalid_save_to_data: true });

    const cards: CardData[] = parse(_cards.toString());
    const removed: string[] = parse(_removed.toString());

    if (!name || !templateId)
      return fail(400, {
        save_to_name: name,
        save_to_templateId: templateId,
        save_to_name_or_template_missing: true,
      });

    try {
      const dashboard = await updateCards(
        user.id,
        params.dashboard,
        cards,
        removed
      );
      await saveDashboardToTemplate(user.id, name, templateId, dashboard, {
        numericVariables: options_numVar,
        stringVariables: options_strVar,
        cards: options_cards,
      });
    } catch (exc) {
      console.error(exc);
      return fail(500, {
        save_to_name: name,
        save_to_templateId: templateId,
        server_error: true,
      });
    }
  },
};
