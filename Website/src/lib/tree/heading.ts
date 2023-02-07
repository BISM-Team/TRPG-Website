import { isModifiersDirective } from "./modifications";
import { isVisibilityDirective } from "./visibility";
import { defaultMatcher, type Matcher } from 'mdast-util-inject'
import type { Root } from 'mdast'
import { toString } from 'mdast-util-to-string'

export function searchHeadingIndex(tree: Root, searchText: string, matcher: Matcher = defaultMatcher) {
    for(let index=0; index<tree.children.length; index++) {
        let child = tree.children[index];
        if(child.type === 'heading' && matcher(toString(child).trim().toLowerCase(), searchText.trim().toLowerCase())) {
            return index;
        }
    }
    return -1;
}

export function getHeadingModifiers(tree: Root, index: number) {
    for (let i=index+1; i<tree.children.length && tree.children[i].type !== 'heading'; i+=1) {
        let child = tree.children[i];
        if(isModifiersDirective(child)) {
            return (child as any).children[0].children[0].value.split(';').map((modifier: string) => { return modifier.trim().toLowerCase(); });
        }
    }
    return []
}

export function getHeadingViewers(tree: Root, index: number) {
    for (let i=index+1; i<tree.children.length && tree.children[i].type !== 'heading'; i+=1) {
        let child = tree.children[i];
        if(isVisibilityDirective(child)) {
            return (child as any).children[0].children[0].value.split(';').map((viewer: string) => { return viewer.trim().toLowerCase(); });
        }
    }
    return []
}