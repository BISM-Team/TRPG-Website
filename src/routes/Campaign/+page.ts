import type { PageLoad } from "./$types";
import { handleFetch } from "$lib/utils";

export const load: PageLoad = async ({ fetch, url }) => {
  const response = await fetch("/api/Campaign");
  await handleFetch(response, url);
  if (!response.ok) throw new Error("unexpected error");
  return { campaigns: (await response.json()).campaigns };
};
