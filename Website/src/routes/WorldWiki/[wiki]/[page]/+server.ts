import { filterOutTree, parseSource, stringifyTree } from '$lib/WorldWiki/tree/tree';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync } from 'fs'
import * as fs from 'fs/promises'
import type { Root } from 'mdast';
import { mergeTrees } from '$lib/WorldWiki/tree/merge.server';
import { allowed_page_names_regex_whole_word } from '$lib/WorldWiki/constants';
import { makeDirective } from '$lib/WorldWiki/tree/heading';
import { logWholeObject } from '$lib/utils';
import { createPage, deletePage, getPage, modifyPage } from '$lib/db/page.server';

export const GET: RequestHandler = async ({ params, locals }) => {
    const user = locals.user;
    if(!user) throw error(401, 'Not logged');
    
    if(!allowed_page_names_regex_whole_word.test(params.wiki) || !allowed_page_names_regex_whole_word.test(params.page)) throw error(400, 'Invalid wiki or page name');

    const page_path = params.wiki+'/'+params.page;

    const page = (await getPage(page_path));
    if(!page) {
        throw error(404, 'Page not found, want to create it?');
    }

    try {
        return json(await filterOutTree(JSON.parse(page.content), user.name));
    } catch (exc) {
        console.log(exc);
        throw error(500, 'Errors in parsing page, try again');
    }
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
    const user = locals.user;
    if(!user) throw error(401, 'Not logged');

    const content_type = request.headers.get('content-type');

    if(!allowed_page_names_regex_whole_word.test(params.wiki) || !allowed_page_names_regex_whole_word.test(params.page)) throw error(400, 'invalid wiki or page name');
    if(!content_type) throw error(400, 'Please supply a content-type header');

    const page_path = params.wiki+'/'+params.page;
    let new_tree: Root;
    if(content_type.includes('text/plain')) {
        new_tree = await parseSource(await request.text());
    } else if(content_type.includes('application/json')) {
        new_tree = await request.json();
    } else { throw error(400, 'Please supply a content-type of either text/plain or application/json') }

    const old_page = await getPage(page_path);
    if(!old_page) {
        new_tree = new_tree.children.length ? new_tree : await parseSource(makeDirective(params.page, { viewers: user.name, modifiers: user.name }));
        try { await createPage(page_path, JSON.stringify(new_tree), []); } 
        catch (exc) { throw error(409, 'Creation conflict'); }
        return new Response('created', {status: 201})
    }

    const old_tree = JSON.parse(old_page.content);
    let mergedTree = mergeTrees(old_tree, new_tree, user.name);
    if(mergedTree.children.length) {
        try { await modifyPage(page_path, JSON.stringify(mergedTree), [], old_page.version); } 
        catch (exc) { throw error(409, 'Update conflict'); }
        return new Response('updated', {status: 200}) 
    } else {
        try { await deletePage(page_path, old_page.version); } 
        catch (exc) { throw error(409, 'Delete conflict'); }
        return new Response('removed', {status: 200})
    }
};