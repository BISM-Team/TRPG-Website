import { unified, Options } from 'unified';
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import inject from 'mdast-util-inject';
import { remove } from 'unist-util-remove'
import { visit } from 'unist-util-visit'
import type { Root } from 'mdast';
import { capitalizeFirstLetter, includes, logWholeObject } from '$lib/utils';

export function stringyfyTree(tree: Root) : string {
  return unified().use(remarkDirective).use(remarkStringify).stringify(tree);
}

export function parseSource(src: string) : Root {
  return unified().use(remarkDirective).use(remarkParse).use(putHeaderIds).parse(src);
}

export async function filterOutTree(tree: Root, username: string) : Promise<Root> {
  return await unified().use(filterOutNonVisible, { username: username }).run(tree);
}

async function prepareTree(tree: Root) {
  return await unified().use(resolveCustomElements).use(remarkRehype).run(tree);
}

export async function renderTree(tree: Root) : Promise<string> {
  return unified().use(rehypeSanitize).use(rehypeStringify).stringify(await prepareTree(tree));
}

export function inject_tag(tag_name: string, tree: Root, to_inject: Root) {
  if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject)) {
      inject('', tree, parseSource(`# ${capitalizeFirstLetter(tag_name)}\n `));
      if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject)) {
        throw new Error('Did you submit an empty Tree ?');
      }
  }
}

function resolveCustomElements() {
  return (tree: Root) => {
    visit(tree, node => {
      if(node.type === 'leafDirective') {
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
      }
    })
  }
}

function isVisibilityDirective(node: any) {
  return (node.type === 'paragraph' && node.children 
     && node.children[0].type === 'textDirective' && node.children[0].name === 'visibility' && node.children[0].children 
     && node.children[0].children[0].type === 'text')
}

function isModifiersDirective(node: any) {
  return (node.type === 'paragraph' && node.children 
     && node.children[0].type === 'textDirective' && node.children[0].name === 'modifiers' && node.children[0].children 
     && node.children[0].children[0].type === 'text')
}

function getVisibility(node: any, username: string) : boolean | null {
  if(isVisibilityDirective(node)) { 
      let viewers: string[] = node.children[0].children[0].value.split(';').map((viewer: string) => { return viewer.trim().toLowerCase(); });
      const low_username = username.trim().toLowerCase();
      return low_username===('gm') || includes(viewers, low_username) || includes(viewers, 'all');
    }
    else { return null; }
}

function isNodeVisible(tree: Root, index: number, username: string) : boolean {
  let current_depth=7;
  let last_vis=true;
  for (let i=index-1; 0<i; i-=1) {
    let child = tree.children[i];
    let visibility = getVisibility(child, username);
    if(visibility != null) last_vis=visibility;
    
    if(child.type === 'heading') {
      if(child.depth >= current_depth) {
        last_vis=true;
        continue;
      }
      if(!last_vis) { 
        return false; 
      }
      else {
        current_depth=child.depth;
      }
      if(child.depth===1) break;
    }
  }
  return true;
}

function isHeaderVisible(tree: Root, index: number, username: string) : boolean {
  if(!isNodeVisible(tree, index, username)) return false;

  for (let i=index+1; i<tree.children.length && tree.children[i].type !== 'heading'; i+=1) {
    let child = tree.children[i];
    let visibility = getVisibility(child, username);
    if(visibility != null) return visibility;
  }
  return true;
}

export function filterOutNonVisible(options: Options) {
  if(!options || !options.username) {
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

export function putHeaderIds() {
  return function(tree: Root) {
    visit(tree, node => {
      if(node.type === 'heading' && (!node.attributes || !node.attributes.id)) {
        console.log('executed');
        const node_data_ref = node.data || (node.data = {})
        const node_attributes_ref = node.attributes || {}
        node.hProperties = {
          id: 'akhbf'
        }
      }
    });
  }
}