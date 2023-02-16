import type { LeafDirective } from 'mdast-util-directive'
import type { Root } from 'mdast'
import type { AdvancedHeading } from './heading'
import crypto from 'crypto'
import { visit }  from 'unist-util-visit'
import { remove } from 'unist-util-remove'
import { isNodeModifiable } from './modifications'
import { isNodeVisible } from './visibility'
import { isTreeVisible } from './tree'

function stripHash(str: string) : {result: string, depth: 1|2|3|4|5|6} {
    let n = 1 as 1|2|3|4|5|6;
    let first=true;
    while(str.length && str[0]==='#') {
        str=str.slice(1);
        if(!first && n<6) n+=1;
        if(first) first=false;
    }
    return {result: str.trimStart(), depth: n};
}

function addHash(str:string, depth: 1|2|3|4|5|6) : string {
    return ('#'.repeat(depth)+' '+str);
}

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
            if(!advHeading.attributes.id) advHeading.attributes.id = ((options ? options.randomizer : undefined) || (() => {return crypto.randomBytes(4).toString('hex')}))();
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