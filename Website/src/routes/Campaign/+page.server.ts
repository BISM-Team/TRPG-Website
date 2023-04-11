import type { Actions, PageServerLoad } from './$types';
import type { DashboardTemplate, NumericVariable, StringVariable, CardData } from '@prisma/client'
import { createDashboard, getDashboardTemplate, getUserDashboards } from '$lib/db/dashboard.server';
import { fail, redirect } from '@sveltejs/kit'

export const load = (async ({ locals }) => {
    const user = locals.user;
    if(user) {
        return {dashboards: await getUserDashboards(user)};
    }
    else throw redirect(302, '/login');
}) satisfies PageServerLoad;

export const actions: Actions = {
    create: async function({ locals, request }) {
        const user = locals.user;
        if(!user) throw redirect(302, '/login')

        const data = await request.formData();
        const name = String(data.get('name'))
        const templateId = String(data.get('template')) || null;
        const numericVariables = JSON.parse(String(data.get('numericVariables')));
        const stringVariables = JSON.parse(String(data.get('stringVariables')));
        const template = templateId ? await getDashboardTemplate(user, templateId) : null;

        if(templateId && !template) return fail(400, {name: name, templateId: templateId, numericVariables: numericVariables, stringVariables: stringVariables, template_non_existant: true})

        let dashboard = {
            name: name,
            templateId: templateId,
            userId: user.id,
            numericVariables: numericVariables,
            stringVariables: stringVariables,
            cards: template ? template.cards : []
        }
        try {
            await createDashboard(dashboard);
        } catch (exc) {
            
        }
    },

    remove: async function({ locals, request }) {
        const data = await request.formData();

    }
}