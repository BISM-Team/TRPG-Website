import type { PageServerLoad, RouteParams } from './$types';
import { renderTree, parseSource, filterOutTree, stringifyTree } from '$lib/tree/tree';
import { inject_tag } from '$lib/tree/modifications'
import { logWholeObject } from '$lib/utils';

interface Page {
    title: string,
    content: string
}

const pages : Page[] = [
    {title: 'index', content: '# Tag 1\n[title1](./title1)'},
    {title: 'title1', content: '# Title 1 \n## Section 1 \ndajlbvlabdvla \n\n## Section 2 \ncvpijbòdkgnmhlwirhdajgvs \n\nend \n\n::youtube[Video of a cat in a box]{#01ab2cd3efg}'},
    {title: 'test', content: '# Page title {#page_title} \n\n:visibility[all] \n\n## Visible to GM only \n\n:visibility[GM] \n\nparahraph with some content \n\nanother paragraph \n\n## Visible to all \n\n:visibility[all] \n\n::youtube[Video of an Interesting Algorithm]{#A60q6dcoCjw} \n\nparagraph with more content'}
]

export const load = (async ({ params }) => {
    let out: {params: RouteParams, index: boolean, page: Page|undefined} = {params: params, index: false, page: undefined};
    if(params.page==='index') {
        out.index=true;
    }
    let page = pages.find(page => {return params.page===page.title;})
    if(page) {
        let tree = await parseSource(stringifyTree(await parseSource(page.content)));
        logWholeObject(stringifyTree(tree));
        await filterOutTree(tree, 'gm');
        await inject_tag('NPCs', tree, await parseSource('- [NPC](test)'));
        out.page = {title: page.title, content: (await renderTree(tree)) }
    }
    return out;
}) satisfies PageServerLoad;