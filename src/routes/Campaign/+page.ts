import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
  const response_1 = await (await fetch("/api/Campaign")).json();
  return { campaigns: response_1.campaigns };
};
