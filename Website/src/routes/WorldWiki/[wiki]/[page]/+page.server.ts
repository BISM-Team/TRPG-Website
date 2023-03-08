import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { allowed_page_names_regex_whole_word } from '$lib/WorldWiki/constants';
import type { Root } from 'mdast';
import { filterOutTree, parseSource, renderTree } from '$lib/WorldWiki/tree/tree';
import { createPage, deletePage, getPage, modifyPage } from '$lib/db/page.server';
import { getHeadingsDb, makeDirective } from '$lib/WorldWiki/tree/heading';
import { mergeTrees } from '$lib/WorldWiki/tree/merge.server';
import { logWholeObject } from '$lib/utils';
import type { Heading } from '@prisma/client';

export const load: PageServerLoad = async ({ params, locals }) => {
    const user = locals.user;
    if(!user) throw error(401, 'Not logged');
    
    if(!allowed_page_names_regex_whole_word.test(params.wiki) || !allowed_page_names_regex_whole_word.test(params.page)) throw error(400, 'Invalid wiki or page name');

    const page_path = params.wiki+'/'+params.page;

    const page = await getPage(page_path);
    if(!page) { throw error(404, 'Page not found, want to create it?'); }

    try {
        const tree = await filterOutTree(JSON.parse(page.content), user.name);
        const headings: (Omit<Heading, "index"> & {viewers: string[]; modifiers: string[]})[] = page.headings.map(heading => {return { 
            pageName: heading.pageName, 
            id: heading.id, 
            text: heading.text, 
            level: heading.level, 
            viewers: heading.viewers.map(viewer => viewer.name), 
            modifiers: heading.modifiers.map(modifier => modifier.name)
        }});
        return { version: page.version, headings: headings, tree: tree, renderedTree: await renderTree(JSON.parse(JSON.stringify(tree)), user.name)};
    } catch (exc) {
        console.log(exc);
        throw error(500, 'Errors in parsing page, try again');
    }
};

export const actions: Actions = {
    default: async ({ locals, params, request }) => {
        const user = locals.user;
        if(!user) return fail(401, {not_logged: true});
        
        if(!allowed_page_names_regex_whole_word.test(params.wiki) || !allowed_page_names_regex_whole_word.test(params.page)) return fail(400, {invalid_page_or_wiki_name: true});
    
        const page_path = params.wiki+'/'+params.page;
        const data = await request.formData();
        
        let new_tree: Root;
        const version = Number(data.get('version') || -1);
        const text = String(data.get('text'));
        const tree = String(data.get('tree'));
        if(data.has('text')) {
            new_tree = await parseSource(text);
        } else if(data.has('tree')) {
            new_tree = JSON.parse(tree);
        }
        else return fail(400, { missing_text_or_tree: true });

        const old_page = await getPage(page_path);
        if(!old_page) {
            new_tree = new_tree.children.length ? new_tree : await parseSource(makeDirective(params.page, { viewers: user.name, modifiers: user.name }));
            const headings = getHeadingsDb(new_tree, page_path);
            try { await createPage(page_path, JSON.stringify(new_tree), headings); } 
            catch (exc) { return fail(409, { creation_conflict: true }); }
            return { created: true }
        }
    
        const old_tree = JSON.parse(old_page.content);
        let mergedTree = mergeTrees(old_tree, new_tree, user.name);
        try { 
            if(mergedTree.children.length) { 
                const headings = getHeadingsDb(mergedTree, page_path);
                await modifyPage(page_path, JSON.stringify(mergedTree), headings, version!==null ? version : old_page.version); 
                return { updated: true }
            }
            else { 
                await deletePage(page_path, version!==null ? version : old_page.version);
                return { deleted: true }
            }
        } 
        catch (exc) { console.error(exc); return fail(409, { update_conflict: true }); }
    }
}