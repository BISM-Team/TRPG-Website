import type { Heading, Page } from '@prisma/client'
import { db } from './db.server'

export async function getViewablePages(name: string) {
    const pages = await db.page.findMany({ 
        where: { name: name }, 
        include: { headings: { include: { viewers: true, modifiers: true }}}
    });
    return pages.filter(page => {
            return (page.headings[0].viewers.findIndex(viewer => viewer.name===name) !== -1);
        }
    );
}

export async function getModifiablePages(name: string) {
    const pages = await db.page.findMany({ 
        where: { name: name }, 
        include: { headings: { include: { viewers: true, modifiers: true }}}
    });
    return pages.filter(page => {
            return (page.headings[0].viewers.findIndex(viewer => viewer.name===name) !== -1) 
                    && 
                   (page.headings[0].modifiers.findIndex(modifier => modifier.name===name) !== -1) ;
        }
    );
}

export async function getPage(name: string) {
    return await db.page.findUnique({ where: { name: name }, include: { headings: { include: { viewers: true, modifiers: true }}}});
}

export async function getPageHeaders(name: string) {
    return await db.page.findUnique({ where: { name: name }, select: { headings: { include: { viewers: true, modifiers: true }}}});
}

export async function createPage(name: string, content: string, headings: (Heading & {viewers: string[]; modifiers: string[];})[]) {
    let _headings = headings.map(heading => { return { id: heading.id, level: heading.level, text: heading.text, index: heading.index, viewers: { connect: heading.viewers.map(viewer => {return {name: viewer}}) }, modifiers: { connect: heading.modifiers.map(modifier => {return {name: modifier}}) }}});
    return await db.page.create({ 
        data: {
            name: name,
            content: content,
            headings: {
                create: _headings
            }
        }
    })
}

export async function modifyPage(name: string, content: string, headings: (Heading & {viewers: string[]; modifiers: string[];})[], version: number) : Promise<Page> {
    let _headings = headings.map(heading => { return { id: heading.id, level: heading.level, text: heading.text, index: heading.index, viewers: { connect: heading.viewers.map(viewer => {return {name: viewer}}) }, modifiers: { connect: heading.modifiers.map(modifier => {return {name: modifier}}) }}});
    return await db.page.update({ 
        where: { name: name, version: version },
        data: { 
            content: content, 
            headings: {
                deleteMany: {},
                create: _headings
            },
            version: {
                increment: 1
            }
        }
    })
}

export async function deletePage(name: string, version: number) {
    return await db.page.delete({ 
        where: { name: name, version: version }
    })
}