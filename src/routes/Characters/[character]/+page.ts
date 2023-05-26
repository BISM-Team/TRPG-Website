import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch, params, url }) => {
  const response = await fetch(
    `/api/Characters/${params.character}?dashboard=true`
  );
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");
  return { character: (await response.json()).character };
}) satisfies PageLoad;
