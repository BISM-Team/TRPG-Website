import { Role, type Campaign, type User } from "@prisma/client";
import { db } from "./db.server";

export async function getUserCampaigns(user: User) {
  return await db.campaign.findMany({
    where: {
      Campaign_User: {
        some: {
          userId: user.id,
        },
      },
    },
  });
}

export async function getUserCampaign(user: User, campaignId: string) {
  return await db.campaign.findUnique({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user.id,
        },
      },
    },
  });
}

export async function createUserCampaign(
  user: User,
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
                id: user.id,
              },
            },
            role: Role.gm,
          },
        ],
      },
    },
  });
}

export async function deleteUserCampaign(user: User, campaignId: string) {
  return await db.campaign.delete({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user.id,
          role: Role.gm,
        },
      },
    },
  });
}
