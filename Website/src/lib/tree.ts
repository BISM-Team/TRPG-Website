import { unified } from 'unified';
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import inject from 'mdast-util-inject';
import type { Root } from 'mdast';
import { capitalizeFirstLetter, resolveCustomElements, filterOutNonVisible } from '$lib/utils';

export function stringyfyTree(tree: Root) : string {
    return unified().use(remarkDirective).use(remarkStringify).stringify(tree);
}

export function parseSource(src: string) : Root {
    return unified().use(remarkDirective).use(remarkParse).parse(src);
}

export async function renderTree(tree: Root) : Promise<string> {
    return unified().use(rehypeSanitize).use(rehypeStringify).stringify(await unified().use(resolveCustomElements).use(filterOutNonVisible).use(remarkRehype).run(tree));
}

export function inject_tag(tag_name: string, tree: Root, to_inject: Root) {
    if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject)) {
        inject('', tree, parseSource(`# ${capitalizeFirstLetter(tag_name)}\n `));
        if(!inject(capitalizeFirstLetter(tag_name), tree, to_inject)) {
            throw new Error('Wtf');
        }
    }
}