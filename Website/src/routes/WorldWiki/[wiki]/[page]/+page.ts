import type { PageLoad } from './$types';
import { renderTree } from '$lib/tree/tree';
import type { Root } from 'mdast';

const username = 'gm';

export const load = (async ({ url, fetch }) => {
    let tree: Root = await (await fetch(url, { 
        headers: {
            'accept': 'application/json'
        }
    })).json();
    return {tree: tree, html: await renderTree(tree, username)};
}) satisfies PageLoad;