import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

function flattenTree(tree: PrismaJson.WikiTreeNode) {
  let result: string[] = [tree.name];
  tree.children.forEach((child) => {
    result = result.concat(flattenTree(child));
  });
  return result;
}

export const GET = async function ({ url, params, fetch }) {
  const modifiable =
    url.searchParams.get("modifiable")?.toLowerCase() === "true";
  const response = await fetch(
    `/api/campaign/${params.campaign}?modifiable=${modifiable}`
  );
  if (!response.ok) return response;
  const campaign = await response.json();

  const result = flattenTree(campaign.wikiTree);

  return json({
    pages: result.filter((page) => page !== "root" && page !== "Unsorted"),
  });
} satisfies RequestHandler;
