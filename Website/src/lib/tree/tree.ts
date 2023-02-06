import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import { remarkHeadingId } from 'remark-custom-heading-id'
import inject from 'mdast-util-inject'
import { remove } from 'unist-util-remove'
import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'
import { capitalizeFirstLetter, includes, logWholeObject } from '$lib/utils'
import { isNodeVisible, isHeaderVisible, isVisibilityDirective, isModifiersDirective } from '$lib/tree/visibility'
import crypto from 'crypto'

export function stringifyTree(tree: Root) : string {
  return unified().use(remarkHeadingId).use(remarkDirective).use(remarkStringify).stringify(tree);
}

export async function parseSource(src: string) : Promise<Root> {
  let tree = unified().use(remarkDirective).use(remarkParse).use(remarkHeadingId).parse(src);
  return await unified().use(addHeaderIds, { randomizer: () => { return crypto.randomBytes(4).toString('hex'); }}).run(tree);
}

export async function filterOutTree(tree: Root, username: string) : Promise<Root> {
  return await unified().use(filterOutNonVisible, { username: username }).run(tree);
}

export async function prepareTree(tree: Root) {
  return await unified().use(remarkHeadingId).use(resolveCustomElements).use(remarkRehype).run(tree);
}

export async function renderTree(tree: Root) : Promise<string> {
  return unified().use(rehypeSanitize).use(rehypeStringify).stringify(await prepareTree(tree));
}

export async function inject_tag(tag_name: string, tree: Root, to_inject: Root) {
  if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject)) {
      inject('', tree, await parseSource(`# ${capitalizeFirstLetter(tag_name)}\n `));
      if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject)) {
        //logWholeObject(tree);
        throw new Error('Did you submit an empty Tree ?');
      }
  }
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

function filterOutNonVisible(options?: {username: string} | void) {
  if(!options) {
    throw new Error('Missing options.username');
  }
  
  return function(tree: Root) {
    remove(tree, { cascade: false }, (child, i, parent) => {
      if(parent===null || parent===undefined || i===null || i===undefined) return false;
      if(child.type === 'root' || parent.type !== 'root') return false;
      switch (child.type) {
        case 'heading':
          return !isHeaderVisible(tree, i, options.username);
        case 'paragraph': 
          if(!isVisibilityDirective(child) && !isModifiersDirective(child)) {
            !isNodeVisible(tree, i, options.username);
          } else {
            return true;
          }
        default:
          return !isNodeVisible(tree, i, options.username);
      }
    });
  }
}

function addHeaderIds(options?: { randomizer: () => string} | void) {
  if(!options) {
    throw new Error('Missing options.randomizer');
  }

  return function(tree: Root) {
    visit(tree, 'heading', node => {
      const ids = node.children.filter(child => child.type === 'idString');
      if(ids.length==0 && options.randomizer) node.children.push({ type: 'idString', value: options.randomizer() });
    });
  }
}