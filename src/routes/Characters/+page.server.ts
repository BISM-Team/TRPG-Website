import { seed } from "$lib/GameSystem/seed";
import { db } from "$lib/db/db.server";
import { createCharacter } from "$lib/db/game_system.server";
import { logWholeObject } from "$lib/utils";
import { getLogin } from "$lib/utils.server";
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
      await seed();

      const character = {
        name: name,
        abilities: await db.ability.findMany({ include: { effects: true } }),
        items: await db.item.findMany({ include: { effects: true } }),
      };
      logWholeObject(character);
      await createCharacter(user.id, character);
    } catch (exc) {
      console.error(exc);
      return fail(500, { ...savedData, server_error: true });
    }
  },
};
