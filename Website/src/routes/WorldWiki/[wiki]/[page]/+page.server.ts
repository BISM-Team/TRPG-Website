import { unified } from 'unified';
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import inject from 'mdast-util-inject';
import type { Root } from 'rehype-sanitize';
import type { PageServerLoad, RouteParams } from './$types';
import { capitalizeFirstLetter, myRemarkPlugin } from '$lib/utils';

function inject_tree(tree: any, content: string) {
    let tree_to_inject = unified().use(remarkParse).parse(content);
    inject('', tree, tree_to_inject);
}

function inject_tag(tree:any, tag_name: string, content: string) {
    let tree_to_inject = unified().use(remarkParse).parse(content);
    if(!inject(capitalizeFirstLetter(tag_name), tree, tree_to_inject)) {
        inject_tree(tree, `# ${capitalizeFirstLetter(tag_name)}\n `);
        if(!inject(capitalizeFirstLetter(tag_name), tree, tree_to_inject)) {
            throw new Error('Wtf');
        }
    }
}

interface Page {
    title: string,
    content: string
}

const pages : Page[] = [
    {title: 'index', content: '# Tag 1\n[title1](./title1)'},
    {title: 'title1', content: '# Title 1 \n## Section 1 \ndajlbvlabdvla \n\n## Section 2 \ncvpijbòdkgnmhlwirhdajgvs \n\nend \n\n::youtube[Video of a cat in a box]{#01ab2cd3efg}'},
    {title: 'test', content: '# Cat videos \n\n::youtube[Video of an Interesting Algorithm]{#A60q6dcoCjw}'}
]

export const load = (async ({params}) => {
    let out: {params: RouteParams, index: boolean, page: Page|undefined} = {params: params, index: false, page: undefined};
    if(params.page==='index') {
        out.index=true;
    }
    let page = pages.find(page => {return params.page===page.title;})
    if(page) {
        let tree = unified().use(remarkParse).use(remarkDirective).parse(page.content);
        inject_tag(tree, 'NPCs', '- [Npc1]');
        let mod_tree : Root = await unified().use(myRemarkPlugin).use(remarkRehype).run(tree);
        out.page = {title: page.title, content: String(unified().use(rehypeSanitize).use(rehypeStringify).stringify(mod_tree)) }
    }
    return out;
}) satisfies PageServerLoad;