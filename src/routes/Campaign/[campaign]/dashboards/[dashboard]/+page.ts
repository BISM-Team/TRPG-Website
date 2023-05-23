import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load = (async ({ params, fetch, url }) => {
  const response = await fetch(
    `/api/Campaign/${params.campaign}/dashboards/${params.dashboard}`
  );
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  const data = await response.json();
  data.dashboard.cards.map((card) => {
    data.dashboard.numericVariables.forEach((variable) => {
      card.source.replaceAll(
        new RegExp(`{${variable.name}}`),
        variable.value.toString()
      );
    });
    data.dashboard.stringVariables.forEach((variable) => {
      card.source.replaceAll(new RegExp(`{${variable.name}}`), variable.value);
    });
  });
  return { dashboard: data.dashboard, params };
}) satisfies PageLoad;
