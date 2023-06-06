import type { List, ListItem, Root } from "mdast";
import { getHeadingModifiability } from "./modifications";
import {
  searchHeadingIndexById,
  type AdvancedHeading,
  getHeadings,
  getFirstHeadingIndexAfter,
  searchHeadingIndex,
  getHeadingsDb,
} from "./heading";
import { getHeadingVisibility } from "./visibility";
import { includes, logWholeObject } from "$lib/utils";
import { getTags, isTagsDirective, makeTagHeadingDirective } from "./tags";
import type { Campaign, Prisma } from "@prisma/client";
import { getPage, modifyPage } from "$lib/db/page.server";
import { allowed_page_names_regex_whole_word } from "../constants";
import { parseSource } from "./tree";
import inject from "mdast-util-inject";
import { createId } from "@paralleldrive/cuid2";
import { error } from "@sveltejs/kit";
import { updateCampaignWikiTree } from "$lib/db/campaign.server";

export function mergeTrees(
  left: Root,
  right: Root,
  user_id: string,
  gm_id: string
): Root {
  const left_headings = getHeadings(left);
  const right_headings = getHeadings(right);
  const resulting_headings: (AdvancedHeading & { left: boolean })[] = [];
  const new_tree: Root = { type: "root", children: [] };

  for (let depth = 1; depth < 6; depth++) {
    let previous_level_heading = -1;
    let last_added_index = -1;
    for (let i = 0; i < left_headings.length; ++i) {
      const heading = left_headings[i];
      if (heading.depth < depth) {
        previous_level_heading = resulting_headings.findIndex((_heading) => {
          return _heading.attributes?.id === heading.attributes?.id;
        });
      } else if (
        heading.depth === depth &&
        (previous_level_heading >= 0 || depth === 1) &&
        (!getHeadingModifiability(heading, user_id, gm_id) ||
          !getHeadingVisibility(heading, user_id, gm_id))
      ) {
        const obj = { ...heading, left: true };
        if (depth === 1) resulting_headings.push(obj);
        else {
          last_added_index =
            Math.max(previous_level_heading, last_added_index) + 1;
          resulting_headings.splice(last_added_index, 0, obj);
        }
      }
    }
    previous_level_heading = -1;
    last_added_index = -1;
    for (let i = 0; i < right_headings.length; ++i) {
      const heading = right_headings[i];
      if (heading.depth < depth) {
        previous_level_heading = resulting_headings.findIndex((_heading) => {
          return _heading.attributes?.id === heading.attributes?.id;
        });
      } else if (
        heading.depth === depth &&
        (previous_level_heading >= 0 || depth === 1) &&
        !includes(resulting_headings, heading, (first, second) => {
          return first.attributes?.id === second.attributes?.id;
        })
      ) {
        const obj = { ...heading, left: false };
        if (depth === 1) resulting_headings.push(obj);
        else {
          last_added_index =
            Math.max(previous_level_heading, last_added_index) + 1;
          resulting_headings.splice(last_added_index, 0, obj);
        }
      }
    }
  }

  for (const heading of resulting_headings) {
    const id = heading.attributes?.id;
    if (id) {
      const index = searchHeadingIndexById(heading.left ? left : right, id);
      if (index === -1)
        throw new Error("Heading not found during merge finalization");
      insertUntilNextHeading(heading.left ? left : right, new_tree, index);
    } else
      console.warn("Heading without id during merge finalization, skipping...");
  }

  return new_tree;
}

function insertUntilNextHeading(src: Root, dest: Root, index: number) {
  let first = true;
  while (
    index !== src.children.length &&
    (first || src.children[index].type !== "heading")
  ) {
    dest.children.push(src.children[index]);
    first = false;
    index++;
  }
}

export async function createTagSection(
  tag_heading: string,
  tree: Root,
  attributes?: { id?: string; viewers?: string; modifiers?: string }
) {
  inject(
    "",
    tree,
    await parseSource(makeTagHeadingDirective(tag_heading, attributes))
  );
}

// finds searched tag or the last list contained in the span of indexes
function findInjectedTag(
  tree: Root,
  start_index: number,
  end_index: number,
  tag: string
) {
  let last_list_index = -1;
  for (let index = start_index; index < end_index; ++index) {
    const child = tree.children[index];
    if (child.type === "list") {
      last_list_index = index;
      for (
        let list_index = 0;
        list_index < child.children.length;
        ++list_index
      ) {
        const list_child = child.children[list_index];
        if (list_child.type === "listItem") {
          for (
            let list_item_index = 0;
            list_item_index < list_child.children.length;
            ++list_item_index
          ) {
            const list_item_child = list_child.children[list_item_index];
            if (list_item_child.type === "paragraph") {
              logWholeObject(list_item_child);
              if (
                list_item_child.children.find(
                  (node) =>
                    node.type === "link" &&
                    node.children[0].type === "text" &&
                    node.children[0].value.toLowerCase() === tag.toLowerCase()
                )
              ) {
                return { list_index: last_list_index, list_item_index };
              }
            }
          }
        }
      }
    }
  }
  return { list_index: last_list_index, list_item_index: -1 };
}

async function delete_tag(tag_section_name: string, tree: Root, tag: string) {
  let index = searchHeadingIndex(tree, tag_section_name);
  if (index === -1) {
    console.warn("tag section not found while deleting: " + tag_section_name);
    return false;
  }
  let last_index = getFirstHeadingIndexAfter(tree, index);
  last_index = last_index === -1 ? tree.children.length : last_index;

  const { list_index, list_item_index } = findInjectedTag(
    tree,
    index,
    last_index,
    tag
  );

  if (list_index >= 0 && list_item_index >= 0) {
    (tree.children[list_index] as List).children.splice(list_item_index, 1);
    return true;
  } else {
    console.warn("tag to delete not found: " + tag);
    return false;
  }
}

function makeTagListItem(tag: string): ListItem {
  return {
    type: "listItem",
    spread: false,
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "link",
            url: tag,
            children: [
              {
                type: "text",
                value: tag,
              },
            ],
          },
        ],
      },
    ],
  };
}

async function inject_tag(tag_section_name: string, tree: Root, tag: string) {
  let index = searchHeadingIndex(tree, tag_section_name);
  if (index === -1) {
    await createTagSection(tag_section_name, tree);
    index = searchHeadingIndex(tree, tag_section_name);
  }
  let last_index = getFirstHeadingIndexAfter(tree, index);
  last_index = last_index === -1 ? tree.children.length : last_index;

  const { list_index, list_item_index } = findInjectedTag(
    tree,
    index,
    last_index,
    tag
  );

  if (list_index >= 0 && list_item_index === -1) {
    (tree.children[list_index] as List).children.push(makeTagListItem(tag));
    return true;
  } else if (list_item_index === -1) {
    console.warn("creating new list");
    if (
      !inject(tag_section_name, tree, await parseSource(` - [${tag}](${tag})`))
    )
      throw error(500, "inject failed for unknonw reasons");
    else return true;
  }
}

async function update_tag(
  tag_section_id: string,
  tree: Root,
  prev_name: string,
  new_name: string
) {
  const deletion = await delete_tag(tag_section_id, tree, prev_name);
  const addition = await inject_tag(tag_section_id, tree, new_name);
  return deletion || addition;
  // TODO update instead of remove and inject again
}

async function getPageAndCache(
  page_cache: {
    name: string;
    tree: Root;
    headings: any;
    hash: string;
    modified: boolean;
  }[],
  page_name: string,
  campaign: Campaign
) {
  let page = page_cache.find((_page) => _page.name === page_name);
  if (!page) {
    const _page = await getPage(page_name, campaign);
    if (!_page) {
      return null;
    }
    page = {
      name: page_name,
      tree: _page.content,
      headings: _page.headings,
      hash: _page.hash,
      modified: false,
    };
    page_cache.push(page);
  }
  return page;
}

function visit<T>(
  node: PrismaJson.WikiTreeNode,
  callback: (node: PrismaJson.WikiTreeNode) => T
) {
  let result = callback(node);
  for (const child of node.children) {
    if (!result) {
      const _result = visit(child, callback);
      if (result) result = _result;
    }
  }
  return result;
}

function getTagFrom(tag: string, from: string, campaign: Campaign) {
  return visit(campaign.wikiTree, (node) => {
    if (node.name.toLowerCase().trim() === from.toLowerCase().trim()) {
      const index = node.children.findIndex(
        (node) => node.name.toLowerCase().trim() === tag.toLowerCase().trim()
      );
      if (index !== -1) {
        const tmp = node.children[index];
        return JSON.parse(JSON.stringify(tmp));
      } else return false;
    } else return false;
  });
}

function spliceTagFrom(tag: string, from: string, campaign: Campaign) {
  return visit(campaign.wikiTree, (node) => {
    if (node.name.toLowerCase().trim() === from.toLowerCase().trim()) {
      const index = node.children.findIndex(
        (node) => node.name.toLowerCase().trim() === tag.toLowerCase().trim()
      );
      if (index !== -1) {
        const tmp = node.children[index];
        node.children.splice(index, 1);
        return tmp;
      } else return false;
    } else return false;
  });
}

function insertTagInto(
  tag: PrismaJson.WikiTreeNode,
  from: string,
  campaign: Campaign
) {
  return visit(campaign.wikiTree, (node) => {
    if (node.name.toLowerCase().trim() === from.toLowerCase().trim()) {
      console.log("node found");
      const index = node.children.findIndex(
        (node) =>
          node.name.toLowerCase().trim() === tag.name.toLowerCase().trim()
      );
      if (index === -1) {
        node.children.push(tag);
        console.log("pushed");
      }
      return true;
    } else return false;
  });
}

export async function handleTags(
  previousPage: string,
  previousTree: Root,
  nextPage: string,
  nextTree: Root,
  user_id: string,
  campaign: Campaign,
  deleting: boolean
) {
  if (nextPage.toLowerCase().trim() === "index") return;

  const tags_before = findTags(previousTree);
  const tags_after = findTags(nextTree);

  const page_cache: {
    name: string;
    tree: Root;
    headings: any;
    hash: string;
    modified: boolean;
  }[] = [];

  let deletedTag: PrismaJson.WikiTreeNode = { name: nextPage, children: [] };

  for (const tag of tags_before) {
    const splitted_tag = tag.split("#");
    if (!allowed_page_names_regex_whole_word.test(splitted_tag[0])) {
      console.warn("invalid tag page: " + splitted_tag[0]);
      continue;
    }
    const page = await getPageAndCache(page_cache, splitted_tag[0], campaign);
    if (!page) {
      console.warn("non-existing tag page: " + splitted_tag[0]);
      continue;
    }

    if (!tags_after.find((_tag) => _tag === tag)) {
      deletedTag =
        spliceTagFrom(previousPage, splitted_tag[0], campaign) || deletedTag;
      deletedTag.name = nextPage;
      if (
        await delete_tag(
          splitted_tag[1] || page.headings[0].text,
          page.tree,
          previousPage
        )
      )
        page.modified = true;
    }
  }
  for (const tag of tags_after) {
    const splitted_tag = tag.split("#");
    if (!allowed_page_names_regex_whole_word.test(splitted_tag[0])) {
      console.warn("invalid tag page: " + splitted_tag[0]);
      continue;
    }

    if (!tags_before.find((_tag) => _tag === tag)) {
      const page = await getPageAndCache(page_cache, splitted_tag[0], campaign);
      if (!page) {
        console.warn("non-existing tag page: " + splitted_tag[0]);
        continue;
      }

      insertTagInto(deletedTag, splitted_tag[0], campaign);
      console.log("insert into: ", deletedTag, splitted_tag[0]);

      if (
        await inject_tag(
          splitted_tag[1] || page.headings[0].text,
          page.tree,
          nextPage
        )
      )
        page.modified = true;
    } else if (previousPage !== nextPage) {
      const page = await getPageAndCache(page_cache, splitted_tag[0], campaign);
      if (!page) {
        console.warn("non-existing tag page: " + splitted_tag[0]);
        continue;
      }

      let tag_node = spliceTagFrom(previousPage, splitted_tag[0], campaign) || {
        name: nextPage,
        children: [],
      };
      tag_node.name = nextPage;
      insertTagInto(tag_node, splitted_tag[0], campaign);

      if (
        await update_tag(
          splitted_tag[1] || page.headings[0].text,
          page.tree,
          previousPage,
          nextPage
        )
      )
        page.modified = true;
    }
  }

  if (tags_before.length === 0) {
    deletedTag =
      spliceTagFrom(previousPage, "Unsorted", campaign) || deletedTag;
  }

  if (tags_after.length === 0 && !deleting) {
    deletedTag.name = nextPage;
    insertTagInto(deletedTag, "Unsorted", campaign);
    console.log("insert into: ", deletedTag, "Unsorted");
  }

  for (const page of page_cache.filter((page) => page.modified)) {
    await modifyPage(
      page.name,
      campaign,
      page.tree,
      getHeadingsDb(page.tree, page.name, campaign.id),
      page.hash,
      createId()
    );
  }

  await updateCampaignWikiTree(user_id, campaign.id, campaign.wikiTree);
}

function findTags(tree: Root): string[] {
  for (let index = 0; index < tree.children.length; ++index) {
    const child = tree.children[index];
    if (child.type === "paragraph" && child.children.length === 1) {
      const tagsDirective = isTagsDirective(child.children[0]);
      if (tagsDirective) {
        return getTags(tagsDirective);
      }
    }
  }
  return [];
}
