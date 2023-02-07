import { unified } from 'unified'
import type { Root } from 'mdast'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import remarkHeadingId from 'remark-custom-heading-id'
import { visit } from 'unist-util-visit'
import { logWholeObject } from '$lib/utils'
import { filterOutNonVisible } from '$lib/tree/visibility'
import { integrateDirectiveInfo } from './modifications'
import crypto from 'crypto'

export function stringifyTree(tree: Root) : string {
  return unified().use(remarkHeadingId).use(remarkDirective).use(remarkStringify).stringify(tree);
}

export async function parseSource(src: string) : Promise<Root> {
  let tree = unified().use(remarkDirective).use(remarkParse).use(remarkHeadingId).parse(src);
  return await unified().use(addHeadingIds).run(tree);
}

export async function filterOutTree(tree: Root, username: string) : Promise<Root> {
  return await unified().use(filterOutNonVisible, { username: username }).run(tree);
}

export async function prepareTree(tree: Root, username: string) {
  return await unified().use(remarkHeadingId).use(integrateDirectiveInfo, {username: username}).use(resolveCustomElements).use(remarkRehype).run(tree);
}

export async function renderTree(tree: Root, username: string) : Promise<string> {
  return unified().use(rehypeSanitize).use(rehypeStringify).stringify(await prepareTree(tree, username));
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

function addHeadingIds(options?: { randomizer?: () => string} | void) {
  return function(tree: Root) {
    visit(tree, 'heading', node => {
      const ids = node.children.filter(child => child.type === 'idString');
      if(ids.length==0) node.children.push({ type: 'idString', value: ( (options ? options.randomizer : undefined) || (() => {return crypto.randomBytes(4).toString('hex')}) )() });
    });
  }
}