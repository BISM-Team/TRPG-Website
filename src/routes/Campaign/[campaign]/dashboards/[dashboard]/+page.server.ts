import {
  deleteDashboard,
  getDashboard,
  updateCards,
  updateDashboard,
} from "$lib/db/dashboard.server";
import { fail } from "@sveltejs/kit";
import { getLogin } from "$lib/utils.server";
import { parse } from "devalue";
import type { CardData, NumericVariable, StringVariable } from "@prisma/client";
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
    const _removedCards = data.get("removedCards");
    if (!_cards || !_removedCards)
      return fail(400, { save_invalid_data: true });

    const cards: CardData[] = parse(_cards.toString());
    const removedCards: string[] = parse(_removedCards.toString());

    try {
      await updateCards(user.id, params.dashboard, cards, removedCards);
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
    const _removedCards = data.get("removedCards");
    if (!_cards || !_removedCards)
      return fail(400, { save_to_invalid_data: true });

    const cards: CardData[] = parse(_cards.toString());
    const removedCards: string[] = parse(_removedCards.toString());

    if (!name || templateId === undefined)
      return fail(400, {
        save_to_name_or_template_missing: true,
      });

    try {
      const dashboard = await updateCards(
        user.id,
        params.dashboard,
        cards,
        removedCards
      );
      await saveDashboardToTemplate(user.id, name, templateId, dashboard, {
        numericVariables: options_numVar,
        stringVariables: options_strVar,
        cards: options_cards,
      });
    } catch (exc) {
      console.error(exc);
      return fail(500, {
        server_error: true,
      });
    }
  },

  settings: async function ({ locals, request, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get("name")?.toString();
    const _numVars = data.get("numVars");
    const _strVars = data.get("strVars");
    const _removedNumVars = data.get("removedNumVars");
    const _removedStrVars = data.get("removedStrVars");
    if (!name || !_numVars || !_strVars || !_removedNumVars || !_removedStrVars)
      return fail(400, { settings_invalid_data: true });

    const numVars: NumericVariable[] = parse(_numVars.toString());
    const strVars: StringVariable[] = parse(_strVars.toString());
    const removedNumVars: string[] = parse(_removedNumVars.toString());
    const removedStrVars: string[] = parse(_removedStrVars.toString());

    try {
      await updateDashboard(
        user.id,
        params.dashboard,
        name,
        numVars,
        strVars,
        removedNumVars,
        removedStrVars
      );
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
    }
  },
};
