import { renderTree } from "$lib/WorldWiki/tree/tree";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const response = await (
    await fetch(`/api/Campaign/${params.campaign}/wiki/${params.page}`)
  ).json();

  return {
    ...response,
    renderedTree: await renderTree(
      JSON.parse(JSON.stringify(response.tree)),
      response.user_id,
      response.gm_id
    ),
  };
};
