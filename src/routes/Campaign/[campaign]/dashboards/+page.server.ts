import type { Actions } from "./$types";
import { createDashboard, deleteDashboard } from "$lib/db/dashboard.server";
import {
  createDashboardFromTemplate,
  getDashboardTemplate,
} from "$lib/db/dashboard_template.server";
import { fail } from "@sveltejs/kit";
import { getUserCampaign } from "$lib/db/campaign.server";
import { getLogin } from "$lib/utils.server";

export const actions: Actions = {
  create: async function ({ locals, request, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get("name")?.toString();
    const templateId = data.get("template")?.toString() || null;
    const template = templateId
      ? await getDashboardTemplate(user.id, templateId)
      : null;

    const savedData = {
      name: name,
      templateId: templateId,
    };

    if (!name) return fail(400, { ...savedData, name_missing: true });

    if (templateId && !template)
      return fail(400, { ...savedData, template_non_existant: true });

    const campaign = await getUserCampaign(user.id, params.campaign);
    if (!campaign)
      return fail(500, { ...savedData, campaign_unaccessible: true });

    try {
      if (!template) await createDashboard(user.id, campaign, name);
      else await createDashboardFromTemplate(user.id, campaign, name, template);
    } catch (exc) {
      console.error(exc);
      return fail(500, { ...savedData, server_error: true });
    }
  },
};
