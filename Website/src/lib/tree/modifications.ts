import { capitalizeFirstLetter, includes } from '$lib/utils'
import { parseSource } from '$lib/tree/tree'
import type { Root } from 'mdast'
import inject from 'mdast-util-inject'
import { includesMatcher } from 'mdast-util-inject'
import { remove } from 'unist-util-remove'
import { isVisibilityDirective } from './visibility'

export function isModifiersDirective(node: any) {
    return (node.type === 'paragraph' && node.children 
        && node.children[0].type === 'textDirective' && node.children[0].name === 'modifiers' && node.children[0].children 
        && node.children[0].children[0].type === 'text')
}

function getModifiability(node: any, username: string) : boolean | null {
    if(isModifiersDirective(node)) { 
        let modifiers: string[] = node.children[0].children[0].value.split(';').map((modifier: string) => { return modifier.trim().toLowerCase(); });
        const low_username = username.trim().toLowerCase();
        return low_username===('gm') || includes(modifiers, low_username) || includes(modifiers, 'all');
    }
    else { return null; }
}

function isNodeModifiable(tree: Root, index: number, username: string) : boolean {
    let current_depth=7;
    let last_mod=false;
    for (let i=index-1; 0<i; i-=1) {
        let child = tree.children[i];
        let modifiability = getModifiability(child, username);
        if(modifiability != null) last_mod=modifiability;
        
        if(child.type === 'heading') {
            if(child.depth >= current_depth) {
                last_mod=false;
                continue;
            }
            if(!last_mod) { 
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

function isHeadingModifiable(tree: Root, index: number, username: string) : boolean {
    if(!isNodeModifiable(tree, index, username)) return false;

    for (let i=index+1; i<tree.children.length && tree.children[i].type !== 'heading'; i+=1) {
        let child = tree.children[i];
        let modifiability = getModifiability(child, username);
        if(modifiability != null) return modifiability;
    }
    return false;
}

export function integrateDirectiveInfo(options?: {username: string} | void) {
    if(!options || !options.username) {
        throw new Error('Missing options.username');
    }

    return function(tree: Root) {
        remove(tree, { cascade: false }, (child, i, parent) => {
            if(isVisibilityDirective(child)) return true;
            if(isModifiersDirective(child)) return true;

            if(parent===null || parent===undefined || i===null || i===undefined) return false;
            if(child.type === 'root' || parent.type !== 'root') return false;
            if(child.type === 'heading' && (isHeadingModifiable(tree, i, options.username) || options.username.trim().toLowerCase()==='gm')) {
                const node_data_ref = child.data || (child.data = {});
                (node_data_ref.hProperties as any).class = ((node_data_ref.hProperties as any).class || '') + 'modifiable';
            }
            return false;
        });
    }
}

export async function inject_tag(tag_name: string, tree: Root, to_inject: Root) {
    if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject, includesMatcher)) {
        inject('', tree, await parseSource(`# ${capitalizeFirstLetter(tag_name)}\n `));
        if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject, includesMatcher)) {
            //logWholeObject(tree);
            throw new Error('Did you submit an empty Tree ?');
        }
    }
}