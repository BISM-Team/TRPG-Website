import type { PageLoad } from './$types';
import { renderTree } from '$lib/WorldWiki/tree/tree';
import { error } from '@sveltejs/kit';

const username = 'gm';

export const load = (async ({ url, fetch }) => {
    const response = await fetch(url, { 
        headers: {
            'accept': 'application/json'
        }
    });
    if(response.ok) {
        const tree = await response.json();
        return {loaded: true, tree: tree, html: await renderTree(tree, username)};
    } else {
        const text = await response.text();
        throw error(response.status, text ? text : response.statusText);
    }
}) satisfies PageLoad;