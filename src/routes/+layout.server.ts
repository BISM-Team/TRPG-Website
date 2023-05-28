import type { Actions } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  return { auth: locals.user ? true : false };
}) satisfies LayoutServerLoad;
