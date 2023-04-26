import type { Campaign, Heading, Page, Prisma, User } from "@prisma/client";
import { db } from "./db.server";

export async function getViewablePages(user: User, campaign: Campaign) {
  const pages = await db.page.findMany({
    where: { campaignId: campaign.id },
    include: { headings: { include: { viewers: true, modifiers: true } } },
  });
  return pages.filter((page) => {
    return (
      page.headings[0].viewers.findIndex((viewer) => viewer.id === user.id) !==
      -1
    );
  });
}

export async function getModifiablePages(user: User, campaign: Campaign) {
  const pages = await db.page.findMany({
    where: { campaignId: campaign.id },
    include: { headings: { include: { viewers: true, modifiers: true } } },
  });
  return pages.filter((page) => {
    return (
      page.headings[0].viewers.findIndex((viewer) => viewer.id === user.id) !==
        -1 &&
      page.headings[0].modifiers.findIndex(
        (modifier) => modifier.id === user.id
      ) !== -1
    );
  });
}

export async function getPage(name: string, campaign: Campaign) {
  return await db.page.findUnique({
    where: { name_campaignId: { name: name, campaignId: campaign.id } },
    include: { headings: { include: { viewers: true, modifiers: true } } },
  });
}

export async function getPageHeaders(name: string, campaign: Campaign) {
  return await db.page.findUnique({
    where: { name_campaignId: { name: name, campaignId: campaign.id } },
    select: { headings: { include: { viewers: true, modifiers: true } } },
  });
}

export async function createPage(
  name: string,
  campaign: Campaign,
  content: Prisma.JsonObject,
  headings: (Heading & { viewers: string[]; modifiers: string[] })[]
) {
  const _headings = headings.map((heading) => ({
    id: heading.id,
    level: heading.level,
    text: heading.text,
    index: heading.index,
    viewers: {
      connect: heading.viewers.map((viewer) => ({ id: viewer })),
    },
    modifiers: {
      connect: heading.modifiers.map((modifier) => ({ id: modifier })),
    },
  }));
  return await db.page.create({
    data: {
      name: name,
      campaignId: campaign.id,
      content: content,
      headings: {
        create: _headings,
      },
    },
  });
}

export async function modifyPage(
  name: string,
  campaign: Campaign,
  content: Prisma.JsonObject,
  headings: (Heading & { viewers: string[]; modifiers: string[] })[],
  version: number
): Promise<Page> {
  const _headings = headings.map((heading) => ({
    id: heading.id,
    level: heading.level,
    text: heading.text,
    index: heading.index,
    viewers: {
      connect: heading.viewers.map((viewer) => ({ id: viewer })),
    },
    modifiers: {
      connect: heading.modifiers.map((modifier) => ({ id: modifier })),
    },
  }));
  return await db.page.update({
    where: {
      name_campaignId: { name: name, campaignId: campaign.id },
      version: version,
    },
    data: {
      content: content,
      headings: {
        deleteMany: {},
        create: _headings,
      },
      version: {
        increment: 1,
      },
    },
  });
}

export async function deletePage(
  name: string,
  campaign: Campaign,
  version: number
) {
  return await db.page.delete({
    where: {
      name_campaignId: { name: name, campaignId: campaign.id },
      version: version,
    },
  });
}
