import { deleteToken } from "$lib/db/auth.server";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, cookies }) => {
  if (locals.user) {
    deleteToken(cookies);
  }
  throw redirect(308, "/");
}) satisfies PageServerLoad;
