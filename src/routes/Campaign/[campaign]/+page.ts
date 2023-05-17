import type { PageLoad } from "./$types";

export const load = (async ({ params, fetch }) => {
  const response = await (
    await fetch(`/api/Campaign/${params.campaign}`)
  ).json();
  return { dashboards: response.dashboards, params };
}) satisfies PageLoad;
