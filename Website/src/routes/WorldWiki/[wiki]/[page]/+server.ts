import { parseSource, stringifyTree } from '$lib/tree/tree';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync } from 'fs'
import * as fs from 'fs/promises'
import type { Root } from 'mdast';
import { mergeTrees } from '$lib/server/tree/merge';

const username = 'player1';

export const POST: RequestHandler = async ({ params, request }) => {
    const wiki_path = `./files/WorldWiki/${params.wiki}`;
    try {
        await fs.mkdir(wiki_path, { recursive: true });
    } catch (exc) {
        throw error(500, 'Unknown error with directory');
    }

    const page_path = `./files/WorldWiki/${params.wiki}/${params.page}.txt`;
    let handle: fs.FileHandle | undefined;
    try {
        let tree: Root = await parseSource(await request.text());
        let tree_dest: Root | undefined = undefined;
        let handle: fs.FileHandle | undefined = undefined;
        try {
            let str = readFileSync(page_path, {encoding: 'utf8'});
            handle = await fs.open(page_path, 'w+');
            tree_dest = await parseSource(str);
            await handle.writeFile(await stringifyTree(mergeTrees(tree_dest, tree, username)));
        } catch (exc) {
            if(tree_dest) throw exc;
            if(!handle) handle = await fs.open(page_path, 'w+');
            await handle.writeFile(await stringifyTree(tree));
        }
        await handle.close();
        return new Response(null, tree_dest ? {status: 200, statusText: 'done'} : {status: 204, statusText: 'created'})
    } catch (exc: any) {
        if(handle) await handle.close();
        throw error(500, 'Unknown error with file');
    }

};