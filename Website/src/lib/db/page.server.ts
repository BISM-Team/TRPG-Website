import type { Header, Page } from '@prisma/client'
import { db } from './db.server'

export async function getPage(name: string) : Promise<Page|null> {
    return await db.page.findUnique({ where: { name: name }});
}

export async function getPageHeaders(name: string) {
    return await db.page.findUnique({ where: { name: name }, select: { headers: { include: { viewers: true, modifiers: true }}}});
}

export async function modifyPage(name: string, content: string, headers: (Header & {viewers: string[]; modifiers: string[];})[], version: number) : Promise<Page> {
    let _headers = headers.map(header => { return { id: header.id, level: header.level, pageName: header.pageName, viewers: { connect: header.viewers.map(viewer => {return {name: viewer}}) }, modifiers: { connect: header.modifiers.map(modifier => {return {name: modifier}}) }}});
    return await db.page.update({ 
        where: { name: name, version: version },
        data: { 
            content: content, 
            headers: {
                deleteMany: {},
                create: _headers
            },
            version: {
                increment: 1
            }
        }
    })
}

export async function createPage(name: string, content: string, headers: (Header & {viewers: string[]; modifiers: string[];})[]) : Promise<Page> {
    let _headers = headers.map(header => { return { id: header.id, level: header.level, pageName: header.pageName, viewers: { connect: header.viewers.map(viewer => {return {name: viewer}}) }, modifiers: { connect: header.modifiers.map(modifier => {return {name: modifier}}) }}});
    return await db.page.create({ 
        data: {
            name: name,
            content: content,
            headers: {
                create: _headers
            }
        }
    })
}

export async function deletePage(name: string, version: number) {
    return await db.page.delete({ 
        where: { name: name, version: version }
    })
}