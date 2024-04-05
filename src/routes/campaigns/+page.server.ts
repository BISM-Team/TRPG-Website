import { createUserCampaign } from "$lib/db/campaign.server";
import { capitalizeFirstLetter } from "$lib/utils";
import { getLogin } from "$lib/utils.server";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  create: async function ({ locals, request }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get("name")?.toString();
    if (!name) return fail(400, { name_missing: true });
    try {
      await createUserCampaign(user.id, {
        name: capitalizeFirstLetter(name),
        wikiTree: {
          name: "root",
          viewers: ["all"],
          modifiers: ["all"],
          children: [
            {
              name: "Index",
              viewers: ["all"],
              modifiers: ["all"],
              children: [],
            },
            {
              name: "Unsorted",
              viewers: ["all"],
              modifiers: ["all"],
              children: [],
            },
          ],
        },
      });
    } catch (exc) {
      console.error(exc);
      return fail(500, { name: name, server_error: true });
    }
  },
};
