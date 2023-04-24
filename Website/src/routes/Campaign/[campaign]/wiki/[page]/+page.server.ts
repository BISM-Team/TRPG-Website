import { error, fail, type HttpError } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { allowed_page_names_regex_whole_word } from "$lib/WorldWiki/constants";
import type { Root } from "mdast";
import {
  filterOutTree,
  parseSource,
  renderTree,
} from "$lib/WorldWiki/tree/tree";
import {
  createPage,
  deletePage,
  getPage,
  modifyPage,
} from "$lib/db/page.server";
import { getHeadingsDb } from "$lib/WorldWiki/tree/heading";
import { mergeTrees } from "$lib/WorldWiki/tree/merge.server";
import { capitalizeFirstLetter, includes } from "$lib/utils";
import type { Heading, Prisma } from "@prisma/client";
import { getLoginOrRedirect } from "$lib/utils.server";
import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = getLoginOrRedirect(locals);
  const campaign = await getUserCampaignWithGmInfo(user, params.campaign);

  if (!campaign || !allowed_page_names_regex_whole_word.test(params.page))
    throw error(400, "Invalid campaign id or page name");

  const gm_id = campaign.Campaign_User[0]
    ? campaign.Campaign_User[0].userId
    : "";

  const page = await getPage(params.page, campaign);
  if (!page) {
    throw error(404, "Page not found, want to create it?");
  }

  try {
    const tree = await filterOutTree(
      page.content as unknown as Root,
      user.id,
      gm_id
    );
    if (!tree.children.length) {
      throw error(403, "Page not viewable");
    }
    const headings: (Omit<Heading, "index"> & {
      viewers: string[];
      modifiers: string[];
    })[] = page.headings.map((heading) => {
      return {
        pageCampaignId: heading.pageCampaignId,
        pageName: heading.pageName,
        id: heading.id,
        text: heading.text,
        level: heading.level,
        viewers: heading.viewers.map((viewer) => viewer.id),
        modifiers: heading.modifiers.map((modifier) => modifier.id),
      };
    });
    return {
      version: page.version,
      headings: headings.filter((heading) => {
        return user.id === gm_id || includes(heading.viewers, user.id);
      }),
      tree: tree,
      renderedTree: await renderTree(
        JSON.parse(JSON.stringify(tree)),
        user.id,
        gm_id
      ),
    };
  } catch (exc) {
    if ((exc as HttpError).status === 403) throw exc;
    console.log(exc);
    throw error(500, "Errors in parsing page, try again");
  }
};

export const actions: Actions = {
  default: async ({ locals, params, request }) => {
    const user = getLoginOrRedirect(locals);
    const campaign = await getUserCampaignWithGmInfo(user, params.campaign);

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
    if (text) {
      new_tree = await parseSource(text, user.id);
    } else if (tree) {
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
