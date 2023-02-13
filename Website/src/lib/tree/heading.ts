import type { Root } from 'mdast'
import type { Heading } from 'mdast'
import inject from 'mdast-util-inject'
import { type Matcher, includesMatcher, defaultMatcher } from 'mdast-util-inject'
import { toString } from 'mdast-util-to-string'
import { capitalizeFirstLetter } from '$lib/utils'
import { parseSource } from './tree'

export interface AdvancedHeading extends Heading {
    attributes?: Record<string, string | null | undefined> | null | undefined
}

function makeDirective(tagName: string, attributes?: any) {
    let id = attributes && attributes.id ? '#'+attributes.id+' ' : '';
    let viewers = attributes && attributes.viewers ? 'viewers=\''+attributes.viewers+'\' ' : '';
    let modifiers = attributes && attributes.modifiers ? 'modifiers=\''+attributes.modifiers+'\' ' : '';
    let attributes_str = id || viewers || modifiers ? '{'+id+viewers+modifiers+'}' : '';
    return `::heading[# ${capitalizeFirstLetter(tagName)}]${attributes_str}`;
}

export async function inject_tag(tag_name: string, tree: Root, to_inject: Root, attributes?: any) {
    if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject, includesMatcher)) {
        inject('', tree, await parseSource(makeDirective(tag_name, attributes)));
        if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject, includesMatcher)) {
            throw new Error('Did you submit an empty Tree ?');
        }
    }
}

export function searchHeadingIndex(tree: Root, searchText: string, matcher: Matcher = defaultMatcher) : number {
    for(let index=0; index<tree.children.length; index++) {
        let child = tree.children[index];
        if(child.type === 'heading' && matcher(toString(child).trim().toLowerCase(), searchText.trim().toLowerCase())) {
            return index;
        }
    }
    return -1;
}

export function searchHeading(tree: Root, searchText: string, matcher: Matcher = defaultMatcher) : AdvancedHeading | undefined {
    for(let index=0; index<tree.children.length; index++) {
        let child = tree.children[index];
        if(child.type === 'heading' && matcher(toString(child).trim().toLowerCase(), searchText.trim().toLowerCase())) {
            return child;
        }
    }
    return undefined;
}