import { unified } from 'unified'
import type { Root } from 'mdast'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import { directiveToHeading, headingToDirective, addHeadingIds, integrateDirectiveInfo, 
         filterOutNonVisible, filterOutNonVisibleLinks, tagsDirectiveToLinks, resolveCustomElements } from './plugins'
import { includesMatcher } from 'mdast-util-inject'
import { getHeadingVisibility } from './visibility'
import { searchHeading } from './heading'
import type { Root as HastRoot } from 'hast'

// WARNING: could have side effects on 'tree' (untested)
export async function stringifyTree(tree: Root) : Promise<string> {
  await unified().use(headingToDirective).run(tree)
  return unified().use(remarkDirective).use(remarkStringify).stringify(tree);
}

export async function parseSource(src: string) : Promise<Root> {
  const tree = unified().use(remarkDirective).use(remarkParse).parse(src);
  return await unified().use(headingToDirective).use(directiveToHeading).use(addHeadingIds).run(tree);
}

export async function filterOutTree(tree: Root, username: string) : Promise<Root> {
  return await unified().use(filterOutNonVisible, { username: username }).use(filterOutNonVisibleLinks, {username: username}).run(tree);
}

async function prepareTree(tree: Root, username: string) {
  return await unified().use(tagsDirectiveToLinks).use(integrateDirectiveInfo, {username: username}).use(resolveCustomElements).use(remarkRehype).run(tree);
}

// WARNING: side effects on 'tree', make a deep copy if you want to use it without modifications made by this function
export async function renderTree(tree: Root, username: string) : Promise<string> {
  return unified().use(rehypeSanitize).use(rehypeStringify).stringify(await prepareTree(tree, username) as HastRoot);
}

export function isTreeVisible(heading_text: string, tree: Root, username: string) : boolean {
  const node = searchHeading(tree, heading_text, includesMatcher);
  if(node && heading_text) {
    return getHeadingVisibility(node, username);
  }
  else throw new Error('Supply a correct heading text (page title for page visibility, section title for section visibility)');
}