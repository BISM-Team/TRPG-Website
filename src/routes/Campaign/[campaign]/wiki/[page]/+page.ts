import { renderTree } from "$lib/WorldWiki/tree/tree";
import { propagateErrors } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch, url }) => {
  const response = await fetch(
    `/api/Campaign/${params.campaign}/wiki/${params.page}`
  );
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");

  const data = await response.json();
  return {
    ...data,
    renderedTree: await renderTree(
      JSON.parse(JSON.stringify(data.tree)),
      data.user_id,
      data.gm_id
    ),
  };
};
