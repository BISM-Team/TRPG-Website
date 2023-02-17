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

export function makeDirective(tagName: string, attributes?: {id?: string, viewers?: string, modifiers?: string}) {
    const id = attributes && attributes.id ? '#'+attributes.id+' ' : '';
    const viewers = attributes && attributes.viewers ? 'viewers=\''+attributes.viewers+'\' ' : '';
    const modifiers = attributes && attributes.modifiers ? 'modifiers=\''+attributes.modifiers+'\' ' : '';
    const attributes_str = id || viewers || modifiers ? '{'+id+viewers+modifiers+'}' : '';
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
        const child = tree.children[index];
        if(child.type === 'heading' && matcher(toString(child).trim().toLowerCase(), searchText.trim().toLowerCase())) {
            return index;
        }
    }
    return -1;
}

export function searchHeading(tree: Root, searchText: string, matcher: Matcher = defaultMatcher) : AdvancedHeading | undefined {
    for(let index=0; index<tree.children.length; index++) {
        const child = tree.children[index];
        if(child.type === 'heading' && matcher(toString(child).trim().toLowerCase(), searchText.trim().toLowerCase())) {
            return child;
        }
    }
    return undefined;
}

export function searchHeadingIndexById(tree: Root, id: string) : number {
    for(let index=0; index<tree.children.length; index++) {
        const child = tree.children[index] as AdvancedHeading;
        if(child.type === 'heading' && child.attributes && child.attributes.id && child.attributes.id===id) {
            return index;
        }
    }
    return -1;
}

export function searchHeadingById(tree: Root, id: string) : AdvancedHeading | undefined {
    for(let index=0; index<tree.children.length; index++) {
        const child = tree.children[index] as AdvancedHeading;
        if(child.type === 'heading' && child.attributes && child.attributes.id && child.attributes.id===id) {
            return child;
        }
    }
    return undefined;
}