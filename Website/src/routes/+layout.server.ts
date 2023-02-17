import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, depends }) => {
    depends('login:state');
    return { auth: locals.user ? true : false };
}) satisfies LayoutServerLoad;