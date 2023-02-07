import type { Root } from 'mdast';
import { includes } from '$lib/utils'
import { remove } from 'unist-util-remove'

export function isVisibilityDirective(node: any) {
    return (node.type === 'paragraph' && node.children 
        && node.children[0].type === 'textDirective' && node.children[0].name === 'visibility' && node.children[0].children 
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

function isNodeVisible(tree: Root, index: number, username: string, startingDepth: number = 7) : boolean {
    let current_depth=startingDepth;
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

function isHeadingVisible(tree: Root, index: number, username: string) : boolean {
    let node = tree.children[index];
    if(node.type !== 'heading') return true;
    if(!isNodeVisible(tree, index, username, node.depth)) return false;

    for (let i=index+1; i<tree.children.length && tree.children[i].type !== 'heading'; i+=1) {
        let child = tree.children[i];
        let visibility = getVisibility(child, username);
        if(visibility != null) return visibility;
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
        switch (child.type) {
            case 'heading':
                return !isHeadingVisible(tree, i, options.username);
            default:
                return !isNodeVisible(tree, i, options.username);
        }
      });
    }
  }