import { unified } from 'unified'
import type { Root } from 'mdast'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import { visit } from 'unist-util-visit'
import { logWholeObject } from '$lib/utils'
import { directiveToHeading, headingToDirective, addHeadingIds, integrateDirectiveInfo, filterOutNonVisible, filterOutNonVisibleLinks } from './plugins'
import { includesMatcher } from 'mdast-util-inject'
import { getHeadingVisibility } from './visibility'
import { searchHeading } from './heading'

export async function stringifyTree(tree: Root) : Promise<string> {
  await unified().use(headingToDirective).run(tree);
  return unified().use(remarkDirective).use(remarkStringify).stringify(tree);
}

export async function parseSource(src: string) : Promise<Root> {
  const tree = unified().use(remarkDirective).use(remarkParse).parse(src);
  return await unified().use(headingToDirective).use(directiveToHeading).use(addHeadingIds).run(tree);
}

export async function filterOutTree(tree: Root, username: string) : Promise<Root> {
  return await unified().use(filterOutNonVisible, { username: username }).use(filterOutNonVisibleLinks, {username: username}).run(tree);
}

export async function prepareTree(tree: Root, username: string) {
  return await unified().use(integrateDirectiveInfo, {username: username}).use(resolveCustomElements).use(remarkRehype).run(tree);
}

export async function renderTree(tree: Root, username: string) : Promise<string> {
  return unified().use(rehypeSanitize).use(rehypeStringify).stringify(await prepareTree(tree, username));
}

export function isTreeVisible(heading_text: string, tree: Root, username: string) : boolean {
  const node = searchHeading(tree, heading_text, includesMatcher);
  if(node && heading_text) {
    return getHeadingVisibility(node, username);
  }
  else throw new Error('Supply a correct heading text (page title for page visibility, section title for section visibility)');
}

function resolveCustomElements() {
  return (tree: Root) => {
    visit(tree, 'leafDirective', node => {
      if(node.name === 'youtube') {
        const node_data_ref = node.data || (node.data = {})
        const node_attributes_ref = node.attributes || {}
        node_data_ref.hName = 'iframe'
        node_data_ref.hProperties = {
          src: 'https://www.youtube.com/embed/' + node_attributes_ref.id,
          width: 200,
          height: 200,
          frameBorder: 0,
          allow: 'picture-in-picture',
          allowFullScreen: true
        }
      }
    })
  }
}