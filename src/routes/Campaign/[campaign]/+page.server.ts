import type { Actions } from "./$types";
import { createDashboard, deleteDashboard } from "$lib/db/dashboard.server";
import { getDashboardTemplate } from "$lib/db/dashboard_template.server";
import { fail } from "@sveltejs/kit";
import { getUserCampaign } from "$lib/db/campaign.server";
import { getLoginOrRedirect } from "$lib/utils.server";

export const actions: Actions = {
  create: async function ({ locals, request, params, url }) {
    const user = getLoginOrRedirect(locals, url);

    const data = await request.formData();
    const name = data.get("name")?.toString();
    const templateId = data.get("template")?.toString() || null;
    const numericVariables = JSON.parse(
      data.get("numericVariables")?.toString() || "[]"
    );
    const stringVariables = JSON.parse(
      data.get("stringVariables")?.toString() || "[]"
    );
    const template = templateId
      ? await getDashboardTemplate(user.id, templateId)
      : null;

    const savedData = {
      name: name,
      templateId: templateId,
      numericVariables: numericVariables,
      stringVariables: stringVariables,
    };

    if (!name) return fail(400, { ...savedData, name_missing: true });

    if (templateId && !template)
      return fail(400, { ...savedData, template_non_existant: true });

    const dashboard = {
      name: name,
      templateId: templateId,
      numericVariables: numericVariables,
      stringVariables: stringVariables,
      cards: template ? template.cards : [],
    };

    const campaign = await getUserCampaign(user.id, params.campaign);
    if (!campaign)
      return fail(500, { ...savedData, campaign_unaccessible: true });

    try {
      await createDashboard(user.id, campaign, dashboard);
    } catch (exc) {
      console.error(exc);
      return fail(500, { ...savedData, server_error: true });
    }
  },

  remove: async function ({ locals, request, params, url }) {
    const user = getLoginOrRedirect(locals, url);

    const data = await request.formData();
    const id = data.get("id")?.toString();

    if (!id) return fail(400, { missing_id: true });

    try {
      await deleteDashboard(user.id, id, params.campaign);
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
    }
  },
};
