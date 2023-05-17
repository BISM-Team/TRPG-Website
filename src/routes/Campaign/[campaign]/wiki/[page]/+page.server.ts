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
import { mergeTrees } from "$lib/WorldWiki/tree/merge.server";
import { capitalizeFirstLetter } from "$lib/utils";
import type { Prisma } from "@prisma/client";
import { getLogin } from "$lib/utils.server";
import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";

export const actions: Actions = {
  default: async ({ locals, params, request, url }) => {
    const user = getLogin(locals, url);
    const campaign = await getUserCampaignWithGmInfo(user.id, params.campaign);

    if (!campaign || !allowed_page_names_regex_whole_word.test(params.page))
      return fail(400, { invalid_campaign_id_or_page_name: true });

    const gm_id = campaign.Campaign_User[0]
      ? campaign.Campaign_User[0].userId
      : "";

    const data = await request.formData();

    let new_tree: Root;
    const version = Number(data.get("version") || -1);
    const text = data.get("text")?.toString();
    const tree = data.get("tree")?.toString();
    if (text !== undefined) {
      new_tree = await parseSource(text, user.id);
    } else if (tree !== undefined) {
      new_tree = JSON.parse(tree);
    } else return fail(400, { missing_text_or_tree: true });

    const old_page = await getPage(params.page, campaign);
    if (!old_page) {
      new_tree = new_tree.children.length
        ? new_tree
        : await parseSource(`# ${capitalizeFirstLetter(params.page)}`, user.id);
      try {
        await createPage(
          params.page,
          campaign,
          new_tree as unknown as Prisma.JsonObject,
          getHeadingsDb(new_tree, params.page, campaign.id)
        );
      } catch (exc) {
        console.error(exc);
        return fail(409, { creation_conflict: true });
      }
      return { created: true };
    }

    const old_tree = old_page.content as unknown as Root;
    const mergedTree = mergeTrees(old_tree, new_tree, user.id, gm_id);
    try {
      if (mergedTree.children.length) {
        await modifyPage(
          params.page,
          campaign,
          mergedTree as unknown as Prisma.JsonObject,
          getHeadingsDb(mergedTree, params.page, campaign.id),
          version !== null ? version : old_page.version
        );
        return { updated: true };
      } else {
        await deletePage(
          params.page,
          campaign,
          version !== null ? version : old_page.version
        );
        return { deleted: true };
      }
    } catch (exc) {
      console.error(exc);
      return fail(409, { update_conflict: true });
    }
  },
};
