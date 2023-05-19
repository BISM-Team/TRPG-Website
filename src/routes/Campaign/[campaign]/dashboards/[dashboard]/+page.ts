import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load = (async ({ params, fetch, url }) => {
  const response = await fetch(
    `/api/Campaign/${params.campaign}/dashboards/${params.dashboard}`
  );
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  const data = await response.json();
  return { dashboard: data.dashboard };
}) satisfies PageLoad;
