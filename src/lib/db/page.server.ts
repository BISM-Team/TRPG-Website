import {
  Role,
  type Campaign,
  type Campaign_User,
  type Heading,
  type Page,
  Prisma,
} from "@prisma/client";
import { db } from "./db.server";

export async function getViewablePages(
  user_id: string,
  campaign: Campaign & {
    Campaign_User: Campaign_User[];
  }
) {
  const gm = campaign.Campaign_User.find(
    (campaign_user) => campaign_user.role === Role.gm
  );
  const pages = await db.page.findMany({
    where: { campaignId: campaign.id },
    include: { headings: { include: { viewers: true, modifiers: true } } },
  });
  return pages.filter((page) => {
    return (
      (gm && user_id === gm.userId) ||
      page.headings[0].viewers.findIndex((viewer) => viewer.id === user_id) !==
        -1
    );
  });
}

export async function getModifiablePages(
  user_id: string,
  campaign: Campaign & {
    Campaign_User: Campaign_User[];
  }
) {
  const gm = campaign.Campaign_User.find(
    (campaign_user) => campaign_user.role === Role.gm
  );
  const pages = await db.page.findMany({
    where: { campaignId: campaign.id },
    include: { headings: { include: { viewers: true, modifiers: true } } },
  });
  return pages.filter((page) => {
    return (
      (gm && user_id === gm.userId) ||
      (page.headings[0].viewers.findIndex((viewer) => viewer.id === user_id) !==
        -1 &&
        page.headings[0].modifiers.findIndex(
          (modifier) => modifier.id === user_id
        ) !== -1)
    );
  });
}

export async function getPage(name: string, campaign: Campaign) {
  return await db.page.findUnique({
    where: { name_campaignId: { name: name, campaignId: campaign.id } },
    include: {
      headings: {
        include: { viewers: true, modifiers: true },
        orderBy: { index: "asc" },
      },
    },
  });
}

export async function getPageHeadings(name: string, campaign: Campaign) {
  return await db.page.findUnique({
    where: { name_campaignId: { name: name, campaignId: campaign.id } },
    select: {
      headings: {
        include: { viewers: true, modifiers: true },
        orderBy: { index: "asc" },
      },
    },
  });
}

export async function createPage(
  name: string,
  campaign: Campaign,
  content: Prisma.JsonValue,
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
      content: content ?? Prisma.JsonNull,
      headings: {
        create: _headings,
      },
    },
  });
}

export async function modifyPage(
  name: string,
  campaign: Campaign,
  content: Prisma.JsonValue,
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
      connect: heading.viewers.map((viewer) => ({ id: viewer })),
    },
    modifiers: {
      connect: heading.modifiers.map((modifier) => ({ id: modifier })),
    },
  }));
  return await db.page.update({
    where: {
      name_campaignId: { name: name, campaignId: campaign.id },
      hash: prev_hash,
    },
    data: {
      content: content ?? Prisma.JsonNull,
      headings: {
        deleteMany: {},
        create: _headings,
      },
      hash: next_hash,
    },
  });
}

export async function deletePage(
  name: string,
  campaign: Campaign,
  prev_hash: string
) {
  return await db.page.delete({
    where: {
      name_campaignId: { name: name, campaignId: campaign.id },
      hash: prev_hash,
    },
  });
}
