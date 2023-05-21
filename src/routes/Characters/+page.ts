import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch, url }) => {
  const response = await fetch("/api/Characters");
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  return { characters: (await response.json()).characters };
}) satisfies PageLoad;
