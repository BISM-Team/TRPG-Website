import type { Root } from 'mdast';
import { includes, logWholeObject } from '$lib/utils'
import { remove } from 'unist-util-remove'
import type { AdvancedHeading } from './heading';

function getVisibility(node: AdvancedHeading, username: string) : boolean {
    const low_username = username.trim().toLowerCase();
    if(low_username===('gm')) return true;
    if(node.attributes && node.attributes.viewers) {
        let viewers: string[] = node.attributes.viewers.split(';').map((viewer: string) => { return viewer.trim().toLowerCase(); });
        return includes(viewers, low_username) || includes(viewers, 'all');
    }
    else return false;
}

function isNodeVisible(tree: Root, index: number, username: string) : boolean {
    let current_depth=7;
    for (let i=index; 0<=i && current_depth>1; i-=1) {
        let child = tree.children[i];
        if(child.type === 'heading') {
            let heading = child as AdvancedHeading;
            if(heading.depth >= current_depth) {
                continue;
            }
            if(!getVisibility(heading, username)) { 
                return false;
            }
            current_depth=heading.depth;
        }
    }
    return true;
}

export function filterOutNonVisible(options?: {username: string} | void) {
    if(!options) {
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