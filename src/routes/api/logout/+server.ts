import { deleteToken } from "$lib/db/auth.server";
import type { RequestHandler } from "./$types";

export const POST = async function ({ locals, cookies }) {
  if (locals.user) deleteToken(cookies);
  return new Response();
} satisfies RequestHandler;
