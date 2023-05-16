import { Role, type Campaign, type User } from "@prisma/client";
import { db } from "./db.server";

export async function getUserCampaigns(user_id: string) {
  return await db.campaign.findMany({
    where: {
      Campaign_User: {
        some: {
          userId: user_id,
        },
      },
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
  return await db.campaign.create({
    data: {
      ...campaign,
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
