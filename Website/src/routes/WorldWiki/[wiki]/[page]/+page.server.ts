import type { PageServerLoad } from './$types';
import { filterOutTree, parseSource } from '$lib/tree/tree';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises'

const username = 'gm';

export const load = (async ({ params }) => {
    const page_path = `./files/WorldWiki/${params.wiki}/${params.page}.txt`;
    let file: string;
    try {
        file = await fs.readFile(page_path, {encoding: 'utf8'});
    } catch (exc: any) {
        console.log('not found: ' + page_path);
        throw error(404, 'Page not found, want to create it?');
    }

    try {
        return {tree: await filterOutTree(await parseSource(file), username)};
    } catch (exc) {
        throw error(500, 'Errors in parsing page, try again');
    }
}) satisfies PageServerLoad;