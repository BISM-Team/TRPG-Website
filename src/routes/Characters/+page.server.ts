import { createDashboard } from "$lib/db/dashboard.server";
import {
  createDashboardFromTemplate,
  getDashboardTemplate,
} from "$lib/db/dashboard_template.server";
import { db } from "$lib/db/db.server";
import { createCharacter } from "$lib/db/game_system.server";
import { getLogin } from "$lib/utils.server";
import { DashboardType } from "@prisma/client";
import { fail, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
  create: async function ({ locals, request, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get("name")?.toString();

    const savedData = {
      name: name,
    };

    if (!name) return fail(400, { ...savedData, name_missing: true });

    try {
      const character_sheet_default = null; //await getDashboardTemplate(...); ensure type === DashboardType.character_sheet
      const character = {
        name: name,
        abilities: await db.ability.findMany({ include: { effects: true } }),
        items: await db.item.findMany({ include: { effects: true } }),
      };
      const dashboardId = character_sheet_default
        ? await createDashboardFromTemplate(
            user.id,
            name,
            character_sheet_default
          )
        : await createDashboard(user.id, name, DashboardType.character_sheet);

      await createCharacter(user.id, dashboardId.id, character);
    } catch (exc) {
      console.error(exc);
      return fail(500, { ...savedData, server_error: true });
    }
  },
};
