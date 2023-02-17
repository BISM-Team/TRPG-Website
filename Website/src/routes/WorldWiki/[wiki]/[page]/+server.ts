import { filterOutTree, parseSource, stringifyTree } from '$lib/WorldWiki/tree/tree';
import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync } from 'fs'
import * as fs from 'fs/promises'
import type { Root } from 'mdast';
import { mergeTrees } from '$lib/server/WorldWiki/tree/merge';
import { name_check_regex } from '$lib/WorldWiki/constants';
import { makeDirective } from '$lib/WorldWiki/tree/heading';

export const GET: RequestHandler = async ({ params, locals }) => {
    const user = locals.user;
    if(!user) throw error(401, 'Not logged');

    const page_path = `./files/WorldWiki/${params.wiki}/${params.page}.txt`;
    let file: string;
    try {
        file = await fs.readFile(page_path, {encoding: 'utf8'});
    } catch (exc: any) {
        console.log('not found: ' + page_path);
        throw error(404, 'Page not found, want to create it?');
    }

    try {
        return json(await filterOutTree(JSON.parse(file), user.name));
    } catch (exc) {
        console.log(exc);
        throw error(500, 'Errors in parsing page, try again');
    }
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
    const user = locals.user;
    if(!user) throw error(401, 'Not logged');

    const content_type = request.headers.get('content-type');

    if(!name_check_regex.test(params.wiki) || !name_check_regex.test(params.page)) throw error(400, 'invalid wiki or page name');
    if(!content_type) throw error(400, 'please supply a content-type header');

    const wiki_path = `./files/WorldWiki/${params.wiki}`;
    try {
        await fs.mkdir(wiki_path, { recursive: true });
    } catch (exc) {
        throw error(500, 'Unknown error with directory');
    }

    let old_file_content: string | undefined = undefined;
    let handle: fs.FileHandle | undefined = undefined;
    try {
        const page_path = `./files/WorldWiki/${params.wiki}/${params.page}.txt`;
        let new_tree: Root;
        if(content_type.includes('text/plain')) {
            new_tree = await parseSource(await request.text());
        } else if(content_type.includes('application/json')) {
            new_tree = await request.json();
        } else { throw error(400, 'please supply a content-type of either text/plain or application/json') }
    
        try {
            old_file_content = readFileSync(page_path, {encoding: 'utf8'});
        } catch (exc) {
            handle = await fs.open(page_path, 'w+');
            new_tree = new_tree.children.length ? new_tree : await parseSource(makeDirective(params.page, { viewers: user.name, modifiers: user.name }));
            await handle.writeFile(JSON.stringify(new_tree));
            await handle.close();
            handle=undefined;
            return new Response('created', {status: 201})
        }

        handle = await fs.open(page_path, 'w+');
        const old_tree = JSON.parse(old_file_content);
        let mergedTree = mergeTrees(old_tree, new_tree, user.name);
        await handle.writeFile(JSON.stringify(mergedTree));
        await handle.close(); 
        handle=undefined;
        if(mergedTree.children.length) {
            return new Response('updated', {status: 200}) 
        } else {
            await fs.unlink(page_path);
            return new Response('removed', {status: 200})
        }
    } catch (exc) {
        if(handle && old_file_content) { 
            await handle.writeFile(old_file_content);
            await handle.close();
            handle=undefined;
        }
        console.error(exc);
        throw error(500, 'Unknown error with file or tree');
    }
};