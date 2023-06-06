import { Role, type Campaign, Prisma } from "@prisma/client";
import { db } from "./db.server";

export async function getUserCampaigns(user_id: string) {
  return await db.campaign_User.findMany({
    where: {
      userId: user_id,
    },
    select: {
      campaign: true,
    },
  });
}

export async function getUserCampaign(user_id: string, campaignId: string) {
  return await db.campaign.findUnique({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id,
        },
      },
    },
  });
}

export async function getUserCampaignWithGmInfo(
  user_id: string,
  campaignId: string
) {
  return await db.campaign.findUnique({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id,
        },
      },
    },
    include: {
      Campaign_User: {
        where: {
          role: Role.gm,
        },
      },
    },
  });
}

export async function createUserCampaign(
  user_id: string,
  campaign: Omit<Campaign, "id" | "createdAt">
) {
  const { wikiTree, ...rest } = campaign;
  return await db.campaign.create({
    data: {
      ...rest,
      wikiTree: wikiTree,
      Campaign_User: {
        create: [
          {
            user: {
              connect: {
                id: user_id,
              },
            },
            role: Role.gm,
          },
        ],
      },
    },
  });
}

export async function deleteUserCampaign(user_id: string, campaignId: string) {
  return await db.campaign.delete({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id,
          role: Role.gm,
        },
      },
    },
  });
}

export async function updateCampaignWikiTree(
  user_id: string,
  campaignId: string,
  wikiTree: PrismaJson.WikiTree
) {
  return await db.campaign.update({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id,
          role: Role.gm,
        },
      },
    },
    data: {
      wikiTree: wikiTree,
    },
  });
}
