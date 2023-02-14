import { filterOutTree, parseSource, stringifyTree } from '$lib/tree/tree';
import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync } from 'fs'
import * as fs from 'fs/promises'
import type { Root } from 'mdast';
import { mergeTrees } from '$lib/server/tree/merge';

const username = 'gm';

export const GET: RequestHandler = async ({ params }) => {
    const page_path = `./files/WorldWiki/${params.wiki}/${params.page}.txt`;
    let file: string;
    try {
        file = await fs.readFile(page_path, {encoding: 'utf8'});
    } catch (exc: any) {
        console.log('not found: ' + page_path);
        throw error(404, 'Page not found, want to create it?');
    }

    try {
        return json(await filterOutTree(await parseSource(file), username));
    } catch (exc) {
        throw error(500, 'Errors in parsing page, try again');
    }
}

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