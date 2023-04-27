import { deleteToken } from "$lib/db/auth.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, cookies }) => {
  if (locals.user) {
    deleteToken(cookies);
  }
}) satisfies PageServerLoad;
