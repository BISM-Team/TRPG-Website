import { getCharacter } from "$lib/db/game_system.server";
import { getLogin } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ locals, params, url }) {
  const user = getLogin(locals);
  const query = url.searchParams;
  const character = await getCharacter(
    user.id,
    params.character,
    query.get("dashboard") && query.get("dashboard") === "true" ? true : false
  );
  if (!character) throw error(404, "character not found");
  return json({ character: character });
} satisfies RequestHandler;
