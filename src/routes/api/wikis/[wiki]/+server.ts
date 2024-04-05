import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWiki, getWikiWithCreatorInfo } from '$lib/db/wikis.server';
import { error } from '@sveltejs/kit';
import { getLogin } from '$lib/utils.server';

function flattenTree(tree: PrismaJson.WikiTreeNode) {
  let result: string[] = [tree.name];
  tree.children.forEach((child) => {
    result = result.concat(flattenTree(child));
  });
  return result;
}

function filterNode(
  user_id: string,
  gm_id: string,
  node: PrismaJson.WikiTreeNode,
  modifiable: boolean
) {
  if (
    user_id !== gm_id &&
    !(modifiable ? node.modifiers : node.viewers).includes('all') &&
    !(modifiable ? node.modifiers : node.viewers).includes(user_id)
  )
    return false;

  node.children = node.children.filter((child) => {
    return filterNode(user_id, gm_id, child, modifiable);
  });
  return true;
}

export const GET = async function ({ url, params, locals }) {
  const user = getLogin(locals);

  const modifiable = url.searchParams.get('modifiable')?.toLowerCase() === 'true';

  const wiki = await getWikiWithCreatorInfo(user.id, params.wiki);
  if (!wiki) error(404, 'Wiki not found');

  filterNode(user.id, wiki.Wiki_User[0].userId, wiki.wikiTree, modifiable);
  //const result = flattenTree(wiki.wikiTree);

  return json({
    //pages: result.filter((page) => page !== 'root' && page !== 'Unsorted')
    wiki
  });
} satisfies RequestHandler;

