import type { PageServerLoad, RouteParams } from './$types';
import { renderTree, parseSource, filterOutTree, stringifyTree } from '$lib/tree/tree';
import { inject_tag } from '$lib/tree/heading'
import { logWholeObject } from '$lib/utils';
import { includesMatcher } from 'mdast-util-inject';
import { mergeTrees } from '$lib/tree/merge';

interface Page {
    title: string,
    content: string
}

const pages : Page[] = [
    {title: 'index', content: '::heading[# Tag 1]{viewers=all}\n[title1](./title1)'},
    {title: 'title1', content: '# Title 1 \n## Section 1 \ndajlbvlabdvla \n\n## Section 2 \ncvpijbòdkgnmhlwirhdajgvs \n\nend \n\n::youtube[Video of a cat in a box]{#01ab2cd3efg}'},
    {title: 'test', content: '::heading[# Test]{#page_title viewers=all} \n\n paragraph visible to all \n\n::heading[## Visible to GM only]{modifiers=GM viewers=GM} \n\nparahraph with some content \n\nanother paragraph \n\n::heading[## Visible to P1 and P2]{viewers=Player1;Player2 modifiers=Player1} \n\n::youtube[Video of an Interesting Algorithm]{#A60q6dcoCjw} \n\nparagraph with more content'}
]

export const load = (async ({ params }) => {
    const out: {params: RouteParams, index: boolean, page: Page|undefined} = {params: params, index: false, page: undefined};
    if(params.page==='index') {
        out.index=true;
    }
    const page = pages.find(page => {return params.page===page.title;})
    if(page) {
        const username = 'gm';
        const tree = await parseSource(await stringifyTree(await parseSource(page.content)));
        await inject_tag('NPCs', tree, await parseSource('- [NPC](test) \n\n - [NPC2](test#section)'), {id: 'ciao', viewers: 'Player1;Player3', modifiers: 'Player3'});
        await filterOutTree(tree, username);
        const left = await parseSource(page.content);
        out.page = {title: page.title, content: (await renderTree(mergeTrees(left, tree, username), username)) }
    }
    return out;
}) satisfies PageServerLoad;