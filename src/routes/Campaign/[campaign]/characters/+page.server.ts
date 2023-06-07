import { addCharacterToCampaign } from "$lib/db/game_system.server";
import { getLogin } from "$lib/utils.server";
import { fail, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
  add: async function ({ locals, request, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const id = data.get("characterId")?.toString();

    if (!id) return fail(400, { id_missing: true });

    try {
      await addCharacterToCampaign(user.id, id, params.campaign);
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
    }
  },
};
