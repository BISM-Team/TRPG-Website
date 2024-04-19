import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { allowed_page_names_regex_whole_word } from '$lib/WorldWiki/constants';
import type { Root } from 'mdast';
import { parseSource } from '$lib/WorldWiki/tree/tree';
import {
  createPage,
  deletePage,
  getPage,
  modifyPage,
  getWikiWithCreatorInfo
} from '$lib/db/wikis.server';
import { getHeadingsDb } from '$lib/WorldWiki/tree/heading';
import { mergeTrees } from '$lib/WorldWiki/tree/merge.server';
import { capitalizeFirstLetter } from '$lib/utils';
import { getLogin } from '$lib/utils.server';
import { createId } from '@paralleldrive/cuid2';
import { handleTags } from '$lib/WorldWiki/tree/tag_injection.server';

export const actions: Actions = {
  create: async ({ locals, params }) => {
    const user = getLogin(locals);
    params.page = capitalizeFirstLetter(params.page);
    const wiki = await getWikiWithCreatorInfo(user.id, params.wiki);

    if (!wiki || !allowed_page_names_regex_whole_word.test(params.page))
      return fail(400, { invalid_wiki_id_or_page_name: true });

    const tree = await parseSource(`# ${params.page} \n\n:tags[]`, user.id);
    try {
      const headings = getHeadingsDb(tree, params.page, wiki.id);
      await handleTags(
        params.page,
        { type: 'root', children: [] },
        params.page,
        tree,
        user.id,
        wiki,
        false,
        headings
      );
      await createPage(params.page, wiki, tree, headings);
    } catch (exc) {
      console.error(exc);
      return fail(409, { creation_conflict: true });
    }
  },

  update: async ({ locals, params, request }) => {
    const user = getLogin(locals);
    const wiki = await getWikiWithCreatorInfo(user.id, params.wiki);

    if (!wiki || !allowed_page_names_regex_whole_word.test(params.page))
      return fail(400, { invalid_campaign_id_or_page_name: true });

    const gm_id = wiki.Wiki_User[0].userId;

    const data = await request.formData();

    let new_tree: Root;
    const prev_hash = data.get('hash')?.toString();
    const text = data.get('text')?.toString();
    const tree = data.get('tree')?.toString();
    if (text !== undefined) {
      new_tree = await parseSource(text, user.id);
    } else if (tree !== undefined) {
      new_tree = JSON.parse(tree);
    } else return fail(400, { missing_text_or_tree: true });

    const old_page = await getPage(params.page, wiki);
    if (!old_page) return fail(400, { missing_page: true });
    if (prev_hash === undefined) return fail(400, { missing_hash: true });

    try {
      const old_tree = old_page.content;
      const mergedTree = mergeTrees(old_tree, new_tree, user.id, gm_id);
      const headings = getHeadingsDb(mergedTree, params.page, wiki.id);
      if (headings.length === 0 || headings[0].level !== 1)
        return fail(400, { no_first_heading: true });

      await handleTags(
        params.page,
        old_tree,
        params.page,
        mergedTree,
        user.id,
        wiki,
        false,
        headings
      );

      await modifyPage(params.page, wiki, mergedTree, headings, prev_hash, createId());
    } catch (exc) {
      console.error(exc);
      return fail(409, { update_conflict: true });
    }
  },

  delete: async ({ locals, params, request }) => {
    const user = getLogin(locals);
    const campaign = await getWikiWithCreatorInfo(user.id, params.wiki);

    if (!campaign || !allowed_page_names_regex_whole_word.test(params.page))
      return fail(400, { invalid_campaign_id_or_page_name: true });

    const data = await request.formData();
    const prev_hash = data.get('hash')?.toString();

    if (prev_hash === undefined) return fail(400, { missing_hash: true });

    try {
      const old_page = await getPage(params.page, campaign);
      if (old_page) {
        await handleTags(
          params.page,
          old_page.content,
          params.page,
          { type: 'root', children: [] },
          user.id,
          campaign,
          true,
          old_page.headings.map((heading) => {
            const { viewers, modifiers, ...rest } = heading;
            return {
              ...rest,
              viewers: viewers.map((viewer) => viewer.id),
              modifiers: modifiers.map((modifier) => modifier.id)
            };
          })
        );
      } else console.warn('page to delete not found');
      await deletePage(params.page, campaign, prev_hash);
    } catch (exc) {
      console.error(exc);
      return fail(409, { delete_conflict: true });
    }
  }
};

