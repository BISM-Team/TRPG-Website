import { deleteToken } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, cookies, depends }) => {
    if(locals.user) { 
        deleteToken(cookies);
    }
    throw redirect(302, '/') 
}) satisfies PageServerLoad;