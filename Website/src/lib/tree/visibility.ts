import type { Root } from 'mdast';
import { includes } from '$lib/utils'
import type { AdvancedHeading } from './heading';

export function getHeadingViewers(node: AdvancedHeading) {
    if(node.attributes && node.attributes.viewers) {
        return node.attributes.viewers.split(';').map((viewer: string) => { return viewer.trim().toLowerCase(); });
    }
    else return [];
}

export function getHeadingVisibility(node: AdvancedHeading, username: string) : boolean {
    const low_username = username.trim().toLowerCase();
    if(low_username===('gm')) return true;
    if(node.attributes && node.attributes.viewers) {
        let viewers: string[] = node.attributes.viewers.split(';').map((viewer: string) => { return viewer.trim().toLowerCase(); });
        return includes(viewers, low_username) || includes(viewers, 'all');
    }
    else return false;
}

export function isNodeVisible(tree: Root, index: number, username: string) : boolean {
    let current_depth=7;
    for (let i=index; 0<=i && current_depth>1; i-=1) {
        let child = tree.children[i];
        if(child.type === 'heading') {
            let heading = child as AdvancedHeading;
            if(heading.depth >= current_depth) {
                continue;
            }
            if(!getHeadingVisibility(heading, username)) { 
                return false;
            }
            current_depth=heading.depth;
        }
    }
    return true;
}