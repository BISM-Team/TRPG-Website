import {
  WikiRole,
  type Campaign,
  type Campaign_User,
  type Heading,
  type Page,
  Prisma,
  type Wiki,
  type Wiki_User
} from '@prisma/client';
import { db } from './db.server';
import type { Root } from 'mdast';

export async function getWikis(user_id: string) {
  return await db.wiki.findMany({ where: { Wiki_User: { some: { userId: user_id } } } });
}

export async function getWiki(user_id: string, wiki_id: string) {
  return await db.wiki.findUnique({
    where: { id: wiki_id, Wiki_User: { some: { userId: user_id } } }
  });
}

export async function getWikiWithCreatorInfo(user_id: string, wiki_id: string) {
  return await db.wiki.findUnique({
    where: { id: wiki_id, Wiki_User: { some: { userId: user_id } } },
    include: {
      Wiki_User: {
        where: {
          role: WikiRole.creator
        }
      }
    }
  });
}

export async function createWiki(
  user_id: string,
  data: { name: string; wikiTree: PrismaJson.WikiTree }
) {
  return await db.wiki.create({
    data: {
      ...data,
      Wiki_User: {
        create: {
          userId: user_id,
          role: WikiRole.creator
        }
      }
    }
  });
}

export async function updateWiki(user_id: string, wiki: Wiki) {
  return await db.wiki.update({
    where: {
      id: wiki.id,
      Wiki_User: {
        some: {
          userId: user_id,
          role: WikiRole.creator
        }
      }
    },
    data: {
      wikiTree: wiki.wikiTree
    }
  });
}

export async function getViewablePages(user_id: string, wiki: Wiki & { Wiki_User: Wiki_User[] }) {
  const pages = await db.page.findMany({
    where: { wikiId: wiki.id },
    include: { headings: { include: { viewers: true, modifiers: true } } }
  });

  const creator = wiki.Wiki_User.find((wiki_user) => wiki_user.role === WikiRole.creator);

  return pages.filter((page) => {
    return (
      (creator && user_id === creator.userId) ||
      page.headings[0].viewers.findIndex((viewer) => viewer.id === user_id) !== -1
    );
  });
}

export async function getModifiablePages(user_id: string, wiki: Wiki & { Wiki_User: Wiki_User[] }) {
  const pages = await db.page.findMany({
    where: { wikiId: wiki.id },
    include: { headings: { include: { viewers: true, modifiers: true } } }
  });

  const creator = wiki.Wiki_User.find((wiki_user) => wiki_user.role === WikiRole.creator);

  return pages.filter((page) => {
    return (
      (creator && user_id === creator.userId) ||
      (page.headings[0].viewers.findIndex((viewer) => viewer.id === user_id) !== -1 &&
        page.headings[0].modifiers.findIndex((modifier) => modifier.id === user_id) !== -1)
    );
  });
}

export async function getPage(name: string, wiki: Wiki) {
  return await db.page.findUnique({
    where: { name_wikiId: { name: name, wikiId: wiki.id } },
    include: {
      headings: {
        include: { viewers: true, modifiers: true },
        orderBy: { index: 'asc' }
      }
    }
  });
}

export async function getPageHeadings(name: string, wiki: Wiki) {
  return await db.page.findUnique({
    where: { name_wikiId: { name: name, wikiId: wiki.id } },
    select: {
      headings: {
        include: { viewers: true, modifiers: true },
        orderBy: { index: 'asc' }
      }
    }
  });
}

export async function createPage(
  name: string,
  wiki: Wiki,
  content: Root,
  headings: (Heading & { viewers: string[]; modifiers: string[] })[]
) {
  const _headings = headings.map((heading) => ({
    id: heading.id,
    level: heading.level,
    text: heading.text,
    index: heading.index,
    viewers: {
      connect: heading.viewers.map((viewer) => ({ id: viewer }))
    },
    modifiers: {
      connect: heading.modifiers.map((modifier) => ({ id: modifier }))
    }
  }));
  return await db.page.create({
    data: {
      name: name,
      wikiId: wiki.id,
      content: content,
      headings: {
        create: _headings
      }
    }
  });
}

export async function modifyPage(
  name: string,
  wiki: Wiki,
  content: Root,
  headings: (Heading & { viewers: string[]; modifiers: string[] })[],
  prev_hash: string,
  next_hash: string
): Promise<Page> {
  const _headings = headings.map((heading) => ({
    id: heading.id,
    level: heading.level,
    text: heading.text,
    index: heading.index,
    viewers: {
      connect: heading.viewers.map((viewer) => ({ id: viewer }))
    },
    modifiers: {
      connect: heading.modifiers.map((modifier) => ({ id: modifier }))
    }
  }));
  return await db.page.update({
    where: {
      name_wikiId: { name: name, wikiId: wiki.id },
      hash: prev_hash
    },
    data: {
      content: content,
      headings: {
        deleteMany: {},
        create: _headings
      },
      hash: next_hash
    }
  });
}

export async function deletePage(name: string, wiki: Wiki, prev_hash: string) {
  return await db.page.delete({
    where: {
      name_wikiId: { name: name, wikiId: wiki.id },
      hash: prev_hash
    }
  });
}

