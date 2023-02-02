import type { PageServerLoad, RouteParams } from './$types';
import { renderTree, parseSource, inject_tag } from '$lib/tree';

interface Page {
    title: string,
    content: string
}

const pages : Page[] = [
    {title: 'index', content: '# Tag 1\n[title1](./title1)'},
    {title: 'title1', content: '# Title 1 \n## Section 1 \ndajlbvlabdvla \n\n## Section 2 \ncvpijbòdkgnmhlwirhdajgvs \n\nend \n\n::youtube[Video of a cat in a box]{#01ab2cd3efg}'},
    {title: 'test', content: '# Cat videos \n\n::youtube[Video of an Interesting Algorithm]{#A60q6dcoCjw}\n:visibility[GM ; Player 1 ; Player 2]'}
]

export const load = (async ({ params }) => {
    let out: {params: RouteParams, index: boolean, page: Page|undefined} = {params: params, index: false, page: undefined};
    if(params.page==='index') {
        out.index=true;
    }
    let page = pages.find(page => {return params.page===page.title;})
    if(page) {
        let tree = parseSource(page.content);
        inject_tag('NPCs', tree, parseSource('- [NPC](test)'));
        out.page = {title: page.title, content: (await renderTree(tree)) }
    }
    return out;
}) satisfies PageServerLoad;