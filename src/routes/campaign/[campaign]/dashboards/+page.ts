import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load = (async ({ params, fetch, url }) => {
  const response = await fetch(`/api/campaign/${params.campaign}/dashboards`);
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  const data = await response.json();
  return { dashboards: data.dashboards, params };
}) satisfies PageLoad;
