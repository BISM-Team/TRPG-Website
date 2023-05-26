import type { Actions } from "./$types";
import { createDashboard } from "$lib/db/dashboard.server";
import {
  createDashboardFromTemplate,
  getDashboardTemplate,
} from "$lib/db/dashboard_template.server";
import { fail } from "@sveltejs/kit";
import { getUserCampaign } from "$lib/db/campaign.server";
import { getLogin } from "$lib/utils.server";
import { Type } from "@prisma/client";

export const actions: Actions = {
  create: async function ({ locals, request, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get("name")?.toString();
    const templateId = data.get("template")?.toString() || null;
    const template = templateId
      ? await getDashboardTemplate(user.id, templateId)
      : null;

    if (!name) return fail(400, { name_missing: true });

    if (templateId && !template)
      return fail(400, { template_non_existant: true });

    const campaign = await getUserCampaign(user.id, params.campaign);
    if (!campaign) return fail(500, { campaign_unaccessible: true });

    try {
      if (!template)
        await createDashboard(user.id, name, Type.dashboard, campaign);
      else await createDashboardFromTemplate(user.id, name, template, campaign);
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
    }
  },
};
