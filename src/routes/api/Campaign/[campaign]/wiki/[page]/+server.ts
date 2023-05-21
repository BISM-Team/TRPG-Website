import { error, json, type HttpError } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getLogin } from "$lib/utils.server";
import { getUserCampaignWithGmInfo } from "$lib/db/campaign.server";
import { allowed_page_names_regex_whole_word } from "$lib/WorldWiki/constants";
import { getPage } from "$lib/db/page.server";
import { filterOutTree } from "$lib/WorldWiki/tree/tree";
import type { Root } from "mdast";
import type { Heading } from "@prisma/client";
import { includes } from "$lib/utils";

export const GET = async function ({ params, locals }) {
  const user = getLogin(locals);
  const campaign = await getUserCampaignWithGmInfo(user.id, params.campaign);

  if (!campaign || !allowed_page_names_regex_whole_word.test(params.page))
    throw error(400, "Invalid campaign or page name");

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
    return json({
      updatedAt: page.updatedAt.toDateString(),
      headings: headings.filter((heading) => {
        return user.id === gm_id || includes(heading.viewers, user.id);
      }),
      tree: tree,
      user_id: user.id,
      gm_id: gm_id,
    });
  } catch (exc) {
    if ((exc as HttpError).status === 403) throw exc;
    console.log(exc);
    throw error(500, "Errors in parsing page, try again");
  }
} satisfies RequestHandler;
