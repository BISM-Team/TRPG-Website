import type { PageServerLoad } from "./$types";
import { createUserCampaign, getUserCampaigns } from "$lib/db/campaign.server";
import { getLoginOrRedirect } from "$lib/utils.server";
import { fail, type Actions } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const user = getLoginOrRedirect(locals);
  return { campaigns: getUserCampaigns(user) };
}) satisfies PageServerLoad;

export const actions: Actions = {
  create: async function ({ locals, request }) {
    const user = getLoginOrRedirect(locals);

    const data = await request.formData();
    const name = data.get("name")?.toString();
    if (!name) return fail(400, { name_missing: true });
    try {
      await createUserCampaign(user, { name: name });
    } catch (exc) {
      console.error(exc);
      return fail(500, { name: name, server_error: true });
    }
  },
};