import { capitalizeFirstLetter, includes } from '$lib/utils'
import { parseSource } from '$lib/tree/tree'
import type { Root } from 'mdast'
import inject from 'mdast-util-inject'
import { includesMatcher } from 'mdast-util-inject'
import { visit } from 'unist-util-visit'
import type { AdvancedHeading } from './heading'

function getModifiability(node: AdvancedHeading, username: string) : boolean {
    const low_username = username.trim().toLowerCase();
    if(low_username===('gm')) return true;
    if(node.attributes && node.attributes.modifiers) {
        let modifiers: string[] = node.attributes.modifiers.split(';').map((modifier: string) => { return modifier.trim().toLowerCase(); });
        return includes(modifiers, low_username) || includes(modifiers, 'all');
    }
    else return false;
}

function isNodeModifiable(tree: Root, index: number, username: string) : boolean {
    let current_depth=7;
    for (let i=index; 0<=i && current_depth>1; i-=1) {
        let child = tree.children[i];
        
        if(child.type === 'heading') {
            let heading = child as AdvancedHeading;
            if(child.depth >= current_depth) {
                continue;
            }
            if(getModifiability(heading, username)) { 
                return true; 
            }
            current_depth=child.depth;
        }
    }
    return false;
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
            let advHeading = child as AdvancedHeading;
            if(advHeading.attributes && advHeading.attributes.id) hProperties_ref.id = advHeading.attributes.id;
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