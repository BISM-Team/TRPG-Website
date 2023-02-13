import { includes } from '$lib/utils'
import type { Root } from 'mdast'
import type { AdvancedHeading } from './heading'

export function getHeadingModifiers(node: AdvancedHeading) {
    if(node.attributes && node.attributes.modifiers) {
        return node.attributes.modifiers.split(';').map((modifier: string) => { return modifier.trim().toLowerCase(); });
    }
    else return [];
}

export function getHeadingModifiability(node: AdvancedHeading, username: string) : boolean {
    const low_username = username.trim().toLowerCase();
    if(low_username===('gm')) return true;
    if(node.attributes && node.attributes.modifiers) {
        let modifiers: string[] = node.attributes.modifiers.split(';').map((modifier: string) => { return modifier.trim().toLowerCase(); });
        return includes(modifiers, low_username) || includes(modifiers, 'all');
    }
    else return false;
}

export function isNodeModifiable(tree: Root, index: number, username: string) : boolean {
    let current_depth=7;
    for (let i=index; 0<=i && current_depth>1; i-=1) {
        let child = tree.children[i];
        
        if(child.type === 'heading') {
            let heading = child as AdvancedHeading;
            if(child.depth >= current_depth) {
                continue;
            }
            if(getHeadingModifiability(heading, username)) { 
                return true; 
            }
            current_depth=child.depth;
        }
    }
    return false;
}