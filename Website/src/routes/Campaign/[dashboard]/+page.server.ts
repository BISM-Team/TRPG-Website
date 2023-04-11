import type { PageServerLoad } from './$types';
import { getDashboard } from '$lib/db/dashboard.server'
import { redirect } from '@sveltejs/kit'

export const load = (async ({ locals, params }) => {
    const user = locals.user;
    if(user) {
        return getDashboard(user, params.dashboard);
    }
    else throw redirect(302, '/login');
}) satisfies PageServerLoad;