import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch, url, params }) => {
  const response = await fetch(`/api/Campaign/${params.campaign}/characters`);
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  return { characters: (await response.json()).characters, params };
}) satisfies PageLoad;
