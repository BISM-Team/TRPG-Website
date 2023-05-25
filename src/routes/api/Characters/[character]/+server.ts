import { getCharacter } from "$lib/db/game_system.server";
import { getLogin } from "$lib/utils.server";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ locals, params, url }) {
  const user = getLogin(locals);
  const character = await getCharacter(user.id, params.character);
  if (!character) throw error(404, "character not found");
  return json({ character: character });
} satisfies RequestHandler;
