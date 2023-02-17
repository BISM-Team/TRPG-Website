import type { PageLoad } from './$types';
import { renderTree } from '$lib/WorldWiki/tree/tree';
import { error, redirect } from '@sveltejs/kit';

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
        if(response.status===401) throw redirect(302, '/login');
        else throw error(response.status, await response.text())
    }
}) satisfies PageLoad;