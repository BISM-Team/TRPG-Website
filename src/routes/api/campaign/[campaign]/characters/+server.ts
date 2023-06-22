import { getCharacters } from "$lib/db/game_system.server";
import { getLogin } from "$lib/utils.server";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ locals, params, url }) {
  const user = getLogin(locals);
  const query = url.searchParams;
  const not_in =
    query.get("not_in") && query.get("not_in") === "true" ? true : false;
  const characters = await getCharacters(user.id, params.campaign, not_in);
  return json({ characters });
} satisfies RequestHandler;
