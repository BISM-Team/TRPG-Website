import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";
import type {
  CardData,
  Dashboard,
  NumericVariable,
  StringVariable,
} from "@prisma/client";

export const load = (async ({ params, fetch, url }) => {
  const response = await fetch(
    `/api/Campaign/${params.campaign}/dashboards/${params.dashboard}`
  );
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  const data = await response.json();
  const new_cards = data.dashboard.cards.map((card) => {
    return _replaceSource(card, data.dashboard);
  });
  const { cards, ...other_dashboard } = data.dashboard;
  return { dashboard: { ...other_dashboard, cards: new_cards }, params };
}) satisfies PageLoad;

export function _replaceSource(
  card: CardData,
  dashboard: Dashboard & {
    numericVariables: NumericVariable[];
    stringVariables: StringVariable[];
  }
) {
  const new_card: CardData & { mod_source: string } = {
    ...card,
    mod_source: card.source,
  };
  dashboard.numericVariables.forEach((variable) => {
    new_card.mod_source = new_card.mod_source.replaceAll(
      new RegExp(`{${variable.name}}`, "gi"),
      variable.value.toString()
    );
  });
  dashboard.stringVariables.forEach((variable) => {
    new_card.mod_source = new_card.mod_source.replaceAll(
      new RegExp(`{${variable.name}}`, "gi"),
      variable.value
    );
  });
  return new_card;
}
