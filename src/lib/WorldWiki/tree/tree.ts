import { unified } from "unified";
import type { Root } from "mdast";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkStringify from "remark-stringify";
import {
  directiveToHeading,
  headingToDirective,
  addHeadingIds,
  customHeadings,
  filterOutNonVisible,
  tagsDirectiveToLinks,
  resolveCustomElements,
} from "./plugins";
import { includesMatcher } from "mdast-util-inject";
import { getHeadingVisibility } from "./visibility";
import { searchHeading } from "./heading";
import type { Root as HastRoot } from "hast";

// WARNING: could have side effects on 'tree' (untested)
export async function stringifyTree(tree: Root): Promise<string> {
  await unified().use(headingToDirective).run(tree);
  return unified().use(remarkDirective).use(remarkStringify).stringify(tree);
}

export async function parseSource(
  src: string,
  user_id?: string
): Promise<Root> {
  const tree = unified().use(remarkDirective).use(remarkParse).parse(src);
  return await unified()
    .use(headingToDirective, user_id ? { user_id: user_id } : undefined)
    .use(directiveToHeading)
    .use(addHeadingIds)
    .run(tree);
}

export async function filterOutTree(
  tree: Root,
  user_id: string,
  gm_id: string
): Promise<Root> {
  return await unified()
    .use(filterOutNonVisible, {
      user_id: user_id,
      gm_id: gm_id,
    }) /*.use(filterOutNonVisibleLinks, {user_id: user_id})*/
    .run(tree);
}

async function prepareTree(tree: Root, user_id: string, gm_id: string) {
  return await unified()
    .use(tagsDirectiveToLinks)
    .use(customHeadings, { user_id: user_id, gm_id })
    .use(resolveCustomElements)
    .use(remarkRehype)
    .run(tree);
}

// WARNING: side effects on 'tree', make a deep copy if you want to use it without modifications made by this function
export async function renderTree(
  tree: Root,
  user_id: string,
  gm_id: string
): Promise<string> {
  return unified()
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .stringify((await prepareTree(tree, user_id, gm_id)) as HastRoot);
}

export function isTreeVisible(
  heading_text: string,
  tree: Root,
  user_id: string,
  gm_id: string
): boolean {
  const node = searchHeading(tree, heading_text, includesMatcher);
  if (node && heading_text) {
    return getHeadingVisibility(node, user_id, gm_id);
  } else
    throw new Error(
      "Supply a correct heading text (page title for page visibility, section title for section visibility)"
    );
}
