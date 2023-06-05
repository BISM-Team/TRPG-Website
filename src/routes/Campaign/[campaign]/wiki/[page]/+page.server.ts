import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { allowed_page_names_regex_whole_word } from "$lib/WorldWiki/constants";
import type { Root } from "mdast";
import { parseSource } from "$lib/WorldWiki/tree/tree";
import {
  createPage,
  deletePage,
  getPage,
  modifyPage,
} from "$lib/db/page.server";
import { getHeadingsDb } from "$lib/WorldWiki/tree/heading";
import { mergeTrees, handleTags } from "$lib/WorldWiki/tree/merge.server";
import { capitalizeFirstLetter } from "$lib/utils";
import type { Prisma } from "@prisma/client";
import { getLogin } from "$lib/utils.server";
import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";
import { createId } from "@paralleldrive/cuid2";

export const actions: Actions = {
  create: async ({ locals, params }) => {
    const user = getLogin(locals);
    params.page = capitalizeFirstLetter(params.page);
    const campaign = await getUserCampaignWithGmInfo(user.id, params.campaign);

    if (!campaign || !allowed_page_names_regex_whole_word.test(params.page))
      return fail(400, { invalid_campaign_id_or_page_name: true });

    const tree = await parseSource(`# ${params.page}`, user.id);
    try {
      await createPage(
        params.page,
        campaign,
        tree as unknown as Prisma.JsonObject,
        getHeadingsDb(tree, params.page, campaign.id)
      );
    } catch (exc) {
      console.error(exc);
      return fail(409, { creation_conflict: true });
    }
  },

  update: async ({ locals, params, request }) => {
    const user = getLogin(locals);
    const campaign = await getUserCampaignWithGmInfo(user.id, params.campaign);

    if (!campaign || !allowed_page_names_regex_whole_word.test(params.page))
      return fail(400, { invalid_campaign_id_or_page_name: true });

    const gm_id = campaign.Campaign_User[0]
      ? campaign.Campaign_User[0].userId
      : "";

    const data = await request.formData();

    let new_tree: Root;
    const prev_hash = data.get("hash")?.toString();
    const text = data.get("text")?.toString();
    const tree = data.get("tree")?.toString();
    if (text !== undefined) {
      new_tree = await parseSource(text, user.id);
    } else if (tree !== undefined) {
      new_tree = JSON.parse(tree);
    } else return fail(400, { missing_text_or_tree: true });

    const old_page = await getPage(params.page, campaign);
    if (!old_page) return fail(400, { missing_page: true });
    if (prev_hash === undefined) return fail(400, { missing_hash: true });

    try {
      const old_tree = old_page.content as unknown as Root;
      const mergedTree = mergeTrees(old_tree, new_tree, user.id, gm_id);
      const headings = getHeadingsDb(mergedTree, params.page, campaign.id);
      if (headings.length === 0 || headings[0].level !== 1)
        return fail(400, { no_first_heading: true });

      await handleTags(
        params.page,
        old_tree,
        params.page,
        mergedTree,
        campaign
      );

      await modifyPage(
        params.page,
        campaign,
        mergedTree as unknown as Prisma.JsonObject,
        headings,
        prev_hash,
        createId()
      );
    } catch (exc) {
      console.error(exc);
      return fail(409, { update_conflict: true });
    }
  },

  delete: async ({ locals, params, request }) => {
    const user = getLogin(locals);
    const campaign = await getUserCampaignWithGmInfo(user.id, params.campaign);

    if (!campaign || !allowed_page_names_regex_whole_word.test(params.page))
      return fail(400, { invalid_campaign_id_or_page_name: true });

    const data = await request.formData();
    const prev_hash = data.get("hash")?.toString();

    if (prev_hash === undefined) return fail(400, { missing_hash: true });

    try {
      const old_page = await getPage(params.page, campaign);
      if (old_page) {
        await handleTags(
          params.page,
          old_page.content as unknown as Root,
          params.page,
          { type: "root", children: [] },
          campaign
        );
      } else console.warn("page to delete not found");
      await deletePage(params.page, campaign, prev_hash);
    } catch (exc) {
      console.error(exc);
      return fail(409, { delete_conflict: true });
    }
  },
};
