import type { Actions, PageServerLoad } from "./$types";
import type {
  DashboardTemplate,
  NumericVariable,
  StringVariable,
  CardData,
} from "@prisma/client";
import {
  createDashboard,
  deleteDashboard,
  getUserDashboards,
} from "$lib/db/dashboard.server";
import { getDashboardTemplate } from "$lib/db/dashboard_template.server";
import { fail, redirect } from "@sveltejs/kit";
import { getUserCampaign } from "$lib/db/campaign.server";
import { getLoginOrRedirect } from "$lib/utils.server";

export const load = (async ({ locals, params }) => {
  const user = getLoginOrRedirect(locals);
  return { dashboards: await getUserDashboards(user, params.campaign) };
}) satisfies PageServerLoad;

export const actions: Actions = {
  create: async function ({ locals, request, params }) {
    const user = getLoginOrRedirect(locals);

    const data = await request.formData();
    const name = data.get("name")?.toString();
    const templateId = String(data.get("template") || "") || null;
    const numericVariables = JSON.parse(
      String(data.get("numericVariables") || "[]")
    );
    const stringVariables = JSON.parse(
      String(data.get("stringVariables") || "[]")
    );
    const template = templateId
      ? await getDashboardTemplate(user, templateId)
      : null;

    let savedData = {
      name: name,
      templateId: templateId,
      numericVariables: numericVariables,
      stringVariables: stringVariables,
    };

    if (!name) return fail(400, { ...savedData, name_missing: true });

    if (templateId && !template)
      return fail(400, { ...savedData, template_non_existant: true });

    let dashboard = {
      name: name,
      templateId: templateId,
      numericVariables: numericVariables,
      stringVariables: stringVariables,
      cards: template ? template.cards : [],
    };

    const campaign = await getUserCampaign(user, params.campaign);
    if (!campaign)
      return fail(500, { ...savedData, campaign_unaccessible: true });

    try {
      await createDashboard(user, campaign, dashboard);
    } catch (exc) {
      console.error(exc);
      return fail(500, { ...savedData, server_error: true });
    }
  },

  remove: async function ({ locals, request, params }) {
    const user = getLoginOrRedirect(locals);

    const data = await request.formData();
    const id = String(data.get("id"));

    if (!id) return fail(400, { missing_id: true });

    try {
      await deleteDashboard(user, id, params.campaign);
    } catch (exc) {
      console.error(exc);
      return fail(500, { server_error: true });
    }
  },
};
