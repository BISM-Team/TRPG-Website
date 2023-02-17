import { deleteToken, getUserFromToken } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle = (async function ({ event, resolve }) {
    let token = event.cookies.get('Authorization');
    event.locals.user = await getUserFromToken(token);
    if(!event.locals.user && token) deleteToken(event.cookies);
    return await resolve(event);
}) satisfies Handle;