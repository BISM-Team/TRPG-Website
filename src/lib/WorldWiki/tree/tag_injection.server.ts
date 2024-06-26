import { getTags, isTagsDirective, makeTagHeadingDirective } from './tags';
import type { Heading, Wiki } from '@prisma/client';
import { getPage, modifyPage, updateWiki } from '$lib/db/wikis.server';
import { allowed_page_names_regex_whole_word } from '../constants';
import { parseSource } from './tree';
import inject from 'mdast-util-inject';
import { createId } from '@paralleldrive/cuid2';
import { error } from '@sveltejs/kit';
import { getFirstHeadingIndexAfter, searchHeadingIndex, getHeadingsDb } from './heading';
import type { List, ListItem, Root } from 'mdast';

async function createTagSection(
  tag_heading: string,
  tree: Root,
  attributes?: { id?: string; viewers?: string; modifiers?: string }
) {
  inject('', tree, await parseSource(makeTagHeadingDirective(tag_heading, attributes)), false);
}

// finds searched tag or the last list contained in the span of indexes
function findInjectedTag(tree: Root, start_index: number, end_index: number, tag: string) {
  let last_list_index = -1;
  for (let index = start_index; index < end_index; ++index) {
    const child = tree.children[index];
    if (child.type === 'list') {
      last_list_index = index;
      for (let list_item_index = 0; list_item_index < child.children.length; ++list_item_index) {
        const list_item = child.children[list_item_index];
        if (list_item.type === 'listItem') {
          for (
            let list_item_child_index = 0;
            list_item_child_index < list_item.children.length;
            ++list_item_child_index
          ) {
            const paragraph = list_item.children[list_item_child_index];
            if (paragraph.type === 'paragraph') {
              if (
                paragraph.children.find(
                  (node) =>
                    node.type === 'link' &&
                    node.children[0].type === 'text' &&
                    node.children[0].value.toLowerCase() === tag.toLowerCase()
                )
              ) {
                return {
                  list_index: last_list_index,
                  list_item_index: list_item_index
                };
              }
            }
          }
        }
      }
    }
  }
  return { list_index: last_list_index, list_item_index: -1 };
}

function makeTagListItem(tag: string): ListItem {
  return {
    type: 'listItem',
    spread: false,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: encodeURI(tag),
            children: [
              {
                type: 'text',
                value: tag
              }
            ]
          }
        ]
      }
    ]
  };
}

async function delete_tag(tag_section_name: string, tree: Root, tag: string) {
  let index = searchHeadingIndex(tree, tag_section_name);
  if (index === -1) {
    console.warn('tag section not found while deleting: ' + tag_section_name);
    return false;
  }
  let last_index = getFirstHeadingIndexAfter(tree, index);
  last_index = last_index === -1 ? tree.children.length : last_index;

  const { list_index, list_item_index } = findInjectedTag(tree, index, last_index, tag);

  if (list_index >= 0 && list_item_index >= 0) {
    (tree.children[list_index] as List).children.splice(list_item_index, 1);
    return true;
  } else {
    console.warn('tag to delete not found: ' + tag);
    return false;
  }
}

async function inject_tag(tag_section_name: string, tree: Root, tag: string, user_id: string) {
  let index = searchHeadingIndex(tree, tag_section_name);
  if (index === -1) {
    await createTagSection(tag_section_name, tree, { viewers: user_id, modifiers: user_id });
    index = searchHeadingIndex(tree, tag_section_name);
  }
  let last_index = getFirstHeadingIndexAfter(tree, index);
  last_index = last_index === -1 ? tree.children.length : last_index;

  const { list_index, list_item_index } = findInjectedTag(tree, index, last_index, tag);

  if (list_index >= 0 && list_item_index === -1) {
    (tree.children[list_index] as List).children.push(makeTagListItem(tag));
    return true;
  } else if (list_item_index === -1) {
    if (!inject(tag_section_name, tree, await parseSource(` - [${tag}](${encodeURI(tag)})`), false))
      error(500, 'inject failed for unknown reasons');
    else return true;
  }
}

async function update_tag(
  tag_section_id: string,
  tree: Root,
  prev_name: string,
  new_name: string,
  user_id: string
) {
  const deletion = await delete_tag(tag_section_id, tree, prev_name);
  const addition = await inject_tag(tag_section_id, tree, new_name, user_id);
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
  wiki: Wiki
) {
  let page = page_cache.find((_page) => _page.name === page_name);
  if (!page) {
    const _page = await getPage(page_name, wiki);
    if (!_page) {
      return null;
    }
    page = {
      name: page_name,
      tree: _page.content,
      headings: _page.headings,
      hash: _page.hash,
      modified: false
    };
    page_cache.push(page);
  }
  return page;
}

function visit<T>(node: PrismaJson.WikiTreeNode, callback: (node: PrismaJson.WikiTreeNode) => T) {
  let result = callback(node);
  for (const child of node.children) {
    if (!result) {
      const _result = visit(child, callback);
      result = _result;
    }
  }
  return result;
}

function spliceTagFrom(tag: string, from: string, wiki: Wiki) {
  return visit(wiki.wikiTree, (node) => {
    if (node.name.toLowerCase().trim() === from.toLowerCase().trim()) {
      const index = node.children.findIndex(
        (_node) => _node.name.toLowerCase().trim() === tag.toLowerCase().trim()
      );
      if (index !== -1) {
        const tmp = node.children[index];
        node.children.splice(index, 1);
        return tmp;
      } else return false;
    } else return false;
  });
}

function insertTagInto(tag: PrismaJson.WikiTreeNode, from: string, wiki: Wiki) {
  return visit(wiki.wikiTree, (node) => {
    if (node.name.toLowerCase().trim() === from.toLowerCase().trim()) {
      const index = node.children.findIndex(
        (node) => node.name.toLowerCase().trim() === tag.name.toLowerCase().trim()
      );
      if (index === -1) {
        node.children.push(tag);
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
  wiki: Wiki,
  deleting: boolean,
  headings: (Heading & {
    viewers: string[];
    modifiers: string[];
  })[]
) {
  if (nextPage.toLowerCase().trim() === 'index') return;

  const tags_before = findTags(previousTree);
  const tags_after = findTags(nextTree);

  const page_cache: {
    name: string;
    tree: Root;
    headings: any;
    hash: string;
    modified: boolean;
  }[] = [];

  let deletedTag: PrismaJson.WikiTreeNode = {
    name: nextPage,
    viewers: headings[0].viewers,
    modifiers: headings[0].modifiers,
    children: []
  };

  if (tags_before.length === 0) {
    const tmp = spliceTagFrom(previousPage, 'Unsorted', wiki);
    deletedTag = tmp || deletedTag;
  }

  for (const tag of tags_before) {
    const splitted_tag = tag.split('#');
    if (!allowed_page_names_regex_whole_word.test(splitted_tag[0])) {
      console.warn('invalid tag page: ' + splitted_tag[0]);
      continue;
    }
    const page = await getPageAndCache(page_cache, splitted_tag[0], wiki);
    if (!page) {
      console.warn('non-existing tag page: ' + splitted_tag[0]);
      continue;
    }

    if (!tags_after.find((_tag) => _tag === tag)) {
      deletedTag = spliceTagFrom(previousPage, splitted_tag[0], wiki) || deletedTag;
      if (await delete_tag(splitted_tag[1] || page.headings[0].text, page.tree, previousPage))
        page.modified = true;
    }
  }
  for (const tag of tags_after) {
    const splitted_tag = tag.split('#');
    if (!allowed_page_names_regex_whole_word.test(splitted_tag[0])) {
      console.warn('invalid tag page: ' + splitted_tag[0]);
      continue;
    }

    if (!tags_before.find((_tag) => _tag === tag)) {
      const page = await getPageAndCache(page_cache, splitted_tag[0], wiki);
      if (!page) {
        console.warn('non-existing tag page: ' + splitted_tag[0]);
        continue;
      }

      deletedTag.name = nextPage;
      deletedTag.viewers = headings[0].viewers;
      deletedTag.modifiers = headings[0].modifiers;
      insertTagInto(deletedTag, splitted_tag[0], wiki);

      if (await inject_tag(splitted_tag[1] || page.headings[0].text, page.tree, nextPage, user_id))
        page.modified = true;
    } else {
      const page = await getPageAndCache(page_cache, splitted_tag[0], wiki);
      if (!page) {
        console.warn('non-existing tag page: ' + splitted_tag[0]);
        continue;
      }

      let tag_node = spliceTagFrom(previousPage, splitted_tag[0], wiki) || {
        name: nextPage,
        viewers: headings[0].viewers,
        modifiers: headings[0].modifiers,
        children: []
      };
      tag_node.name = nextPage;
      tag_node.viewers = headings[0].viewers;
      tag_node.modifiers = headings[0].modifiers;
      insertTagInto(tag_node, splitted_tag[0], wiki);

      if (
        await update_tag(
          splitted_tag[1] || page.headings[0].text,
          page.tree,
          previousPage,
          nextPage,
          user_id
        )
      )
        page.modified = true;
    }
  }

  if (tags_after.length === 0 && !deleting) {
    deletedTag.name = nextPage;
    insertTagInto(deletedTag, 'Unsorted', wiki);
  }

  for (const page of page_cache.filter((page) => page.modified)) {
    await modifyPage(
      page.name,
      wiki,
      page.tree,
      getHeadingsDb(page.tree, page.name, wiki.id),
      page.hash,
      createId()
    );
  }

  await updateWiki(user_id, wiki);
}

function findTags(tree: Root): string[] {
  for (let index = 0; index < tree.children.length; ++index) {
    const child = tree.children[index];
    if (child.type === 'paragraph' && child.children.length === 1) {
      const tagsDirective = isTagsDirective(child.children[0]);
      if (tagsDirective) {
        return getTags(tagsDirective);
      }
    }
  }
  return [];
}

