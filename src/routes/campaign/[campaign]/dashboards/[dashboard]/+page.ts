import { propagateErrors, replaceCardSource } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load = (async ({ params, fetch, url }) => {
  const response = await fetch(
    `/api/campaign/${params.campaign}/dashboards/${params.dashboard}`
  );
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  const data = await response.json();
  const new_cards = data.dashboard.cards.map((card) => {
    return replaceCardSource(card, data.dashboard);
  });
  const { cards, ...other_dashboard } = data.dashboard;
  return { dashboard: { ...other_dashboard, cards: new_cards }, params };
}) satisfies PageLoad;

