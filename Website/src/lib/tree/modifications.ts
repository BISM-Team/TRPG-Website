import { capitalizeFirstLetter } from '$lib/utils'
import { parseSource } from '$lib/tree/tree'
import type { Root } from 'mdast'
import inject from 'mdast-util-inject'
import { includesMatcher } from 'mdast-util-inject'

export function isModifiersDirective(node: any) {
    return (node.type === 'paragraph' && node.children 
        && node.children[0].type === 'textDirective' && node.children[0].name === 'modifiers' && node.children[0].children 
        && node.children[0].children[0].type === 'text')
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