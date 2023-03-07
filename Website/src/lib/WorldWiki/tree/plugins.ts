import type { LeafDirective } from 'mdast-util-directive'
import type { Root, Link } from 'mdast'
import { stripHash, addHash, type AdvancedHeading } from './heading'
import { visit }  from 'unist-util-visit'
import { remove } from 'unist-util-remove'
import { isNodeModifiable } from './modifications'
import { isNodeVisible } from './visibility'
import { isTreeVisible } from './tree'
import { getTags } from './tags'
import { randomHex } from '$lib/utils'

export function directiveToHeading() {
    return function(tree: Root) {
        visit(tree, 'leafDirective', node => {
            if(node.name === 'heading' && node.children && node.children[0]) {
                const child=node.children[0];
                if(child.type === 'text') {
                    delete (node as any).name;
                    const advHeading = (node as unknown) as AdvancedHeading;
                    advHeading.type='heading';
                    const res = stripHash(child.value);
                    child.value = res.result;
                    advHeading.depth = res.depth;
                }
            }
        })
    }
}

export function headingToDirective() {
    return function(tree: Root) {
        visit(tree, 'heading', node => {
            if(node.children && node.children[0]) {
                const child=node.children[0];
                if(child.type === 'text') {
                    const directive = (node as unknown) as LeafDirective;
                    directive.type='leafDirective';
                    directive.name='heading';
                    directive.attributes = directive.attributes || {}
                    child.value = addHash(child.value, node.depth);
                    delete (node as any).depth;
                }
            }
        })
    }
}

export function addHeadingIds(options?: { randomizer?: () => string} | void) {
    return function(tree: Root) {
        visit(tree, 'heading', node => {
            const advHeading = node as AdvancedHeading;
            advHeading.attributes = advHeading.attributes || {};
            if(!advHeading.attributes.id) advHeading.attributes.id = ((options ? options.randomizer : undefined) || (() => randomHex(4)))();
        });
    }
}

export function filterOutNonVisible(options?: {username: string} | void) {
    if(!options || !options.username) {
        throw new Error('Missing options.username');
    }
    
    return function(tree: Root) {
      remove(tree, { cascade: false }, (child, i, parent) => {
        if(parent===null || parent===undefined || i===null || i===undefined) return false;
        if(child.type === 'root' || parent.type !== 'root') return false;
        return !isNodeVisible(tree, i, options.username);
      });
    }
}

export function filterOutNonVisibleLinks(options?: {username: string} | void) {
    if(!options || !options.username) {
        throw new Error('Missing options.username');
    }

    return function(tree: Root) {
        remove(tree, { cascade: true }, (child, i, parent) => {
            if(parent===null || parent===undefined || i===null || i===undefined) return false;
            if(child.type==='link' && (child as any).url) {
                try {
                    let targets = (child as any).url.split('/');
                    targets = targets[targets.length-1].split('#');
                    const header_text = targets[targets.length-1];
                    return !isTreeVisible(header_text, tree, options.username);
                } catch(exc: any) {
                    return false;
                }
            }
            else return false;
        });
    }
}

export function integrateDirectiveInfo(options?: {username: string} | void) {
    if(!options || !options.username) {
        throw new Error('Missing options.username');
    }

    return function(tree: Root) {
        visit(tree, 'heading', (child, i) => {
            if(i===null) return;
            const node_data_ref = child.data || (child.data = { hProperties: {}});
            const hProperties_ref = (node_data_ref.hProperties as any);
            if(isNodeModifiable(tree, i, options.username)) {
                hProperties_ref.class = (hProperties_ref.class || '') + 'modifiable';
            }
            const advHeading = child as AdvancedHeading;
            if(advHeading.attributes && advHeading.attributes.id) hProperties_ref.id = advHeading.attributes.id;
        });
    }
}

export function tagsDirectiveToLinks() {
    return function(tree: Root) {
        visit(tree, 'textDirective', (node, i, parent) => {
            const tags = getTags(node);
            if(tags && parent) {
                if(tags.length) parent.children.push({type: 'text', value: 'Tags: '})
                for(let n=0; n<tags.length; ++n) {
                    let link: Link = {type: 'link', url: tags[n], children: [{type: 'text', value: tags[n]}]}
                    parent.children.push(link as any)
                    if(n!=tags.length-1) parent.children.push({type: 'text', value: ', '})
                }
                parent.children.splice(0, 1);
            }
        })
    }
}

export function resolveCustomElements() {
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