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
    getDashboardTemplate,
    getUserDashboards,
} from "$lib/db/dashboard.server";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
    const user = locals.user;
    if (!user) throw redirect(302, "/login");
    return { dashboards: await getUserDashboards(user) };
}) satisfies PageServerLoad;

export const actions: Actions = {
    create: async function ({ locals, request }) {
        const user = locals.user;
        if (!user) throw redirect(302, "/login");

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

        console.log({
            name: name,
            templateId: templateId,
            numericVariables: numericVariables,
            stringVariables: stringVariables,
            cards: template ? template.cards : [],
        });

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
        try {
            await createDashboard(user, dashboard);
        } catch (exc) {
            console.error(exc);
            return fail(500, { ...savedData, server_error: true });
        }
    },

    remove: async function ({ locals, request }) {
        const user = locals.user;
        if (!user) throw redirect(302, "/login");

        const data = await request.formData();
        const id = String(data.get("id"));

        if (!id) return fail(400, { missing_id: true });

        try {
            await deleteDashboard(user, id);
        } catch (exc) {
            console.error(exc);
            return fail(500, { server_error: true });
        }
    },
};
