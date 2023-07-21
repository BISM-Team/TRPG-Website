import { propagateErrors, replaceCardSource } from "$lib/utils";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch, params, url }) => {
  const response = await fetch(
    `/api/characters/${params.character}?dashboard=true`
  );
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  const data = await response.json();
  if (!data.character || !("dashboard" in data.character)) throw error(404);
  const character_dashboard = data.character.dashboard;
  const new_cards = data.character.dashboard.cards.map((card) => {
    return replaceCardSource(card, character_dashboard);
  });
  const { cards, ...other_dashboard } = character_dashboard;
  const { dashboard, ...other_character } = data.character;
  return {
    character: other_character,
    dashboard: { ...other_dashboard, cards: new_cards },
    params,
  };
}) satisfies PageLoad;

