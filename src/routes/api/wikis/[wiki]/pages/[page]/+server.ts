import { error, json, type HttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLogin } from '$lib/utils.server';
import { allowed_page_names_regex_whole_word } from '$lib/WorldWiki/constants';
import { getPage } from '$lib/db/wikis.server';
import { filterOutTree } from '$lib/WorldWiki/tree/tree';
import type { Heading } from '@prisma/client';
import { includes } from '$lib/utils';
import { getWikiWithCreatorInfo } from '$lib/db/wikis.server';

export const GET = async function ({ params, locals, fetch }) {
  const user = getLogin(locals);
  const wiki = await getWikiWithCreatorInfo(user.id, params.wiki);

  if (!wiki || !allowed_page_names_regex_whole_word.test(params.page))
    error(400, 'Invalid wiki or page name');

  const gm_id = wiki.Wiki_User[0].userId;

  const page = await getPage(params.page, wiki);
  if (!page) {
    error(404, 'Page not found, want to create it?');
  }

  try {
    const tree = await filterOutTree(page.content, user.id, gm_id);
    if (!tree.children.length) {
      error(403, 'Page not viewable');
    }
    const headings: (Omit<Heading, 'index'> & {
      viewers: string[];
      modifiers: string[];
    })[] = page.headings.map((heading) => {
      return {
        pageWikiId: heading.pageWikiId,
        pageName: heading.pageName,
        id: heading.id,
        text: heading.text,
        level: heading.level,
        viewers: heading.viewers.map((viewer) => viewer.id),
        modifiers: heading.modifiers.map((modifier) => modifier.id)
      };
    });
    return json({
      hash: page.hash,
      headings: headings.filter((heading) => {
        return user.id === gm_id || includes(heading.viewers, user.id);
      }),
      tree: tree,
      user_id: user.id,
      gm_id: gm_id
    });
  } catch (exc) {
    if ((exc as HttpError).status === 403) throw exc;
    console.error(exc);
    error(500, 'Errors in parsing page, try again');
  }
} satisfies RequestHandler;

