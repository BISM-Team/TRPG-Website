import { deleteToken } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, cookies }) => {
    if(locals.user) { 
        deleteToken(cookies);
        return { logged_out: true }
    }
    else throw redirect(302, '/');
}) satisfies PageServerLoad;