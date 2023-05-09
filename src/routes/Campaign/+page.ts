import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
  const response = await (await fetch("/api/Campaign")).json();

  return { campaigns: response.campaigns };
}) satisfies PageLoad;
