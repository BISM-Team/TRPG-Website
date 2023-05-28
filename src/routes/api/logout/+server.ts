import { deleteToken } from "$lib/db/auth.server";
import { getLogin } from "$lib/utils.server";
import type { RequestHandler } from "./$types";

export const POST = async function ({ locals, cookies }) {
  if (getLogin(locals)) deleteToken(cookies);
} satisfies RequestHandler;
