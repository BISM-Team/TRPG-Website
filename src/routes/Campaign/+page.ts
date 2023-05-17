import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { handleFetchError } from "$lib/utils";

export const load: PageLoad = async ({ fetch, url }) => {
  const response = await fetch("/api/Campaign");
  await handleFetchError(response, url);
  const data = await response.json();
  return { campaigns: data.campaigns };
};
