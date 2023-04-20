import type { Campaign, User } from "@prisma/client";
import { db } from "./db.server";

export async function getUserCampaigns(user: User) {
  return await db.campaign.findMany({
    where: {
      users: {
        some: {
          id: user.id,
        },
      },
    },
  });
}

export async function getUserCampaign(user: User, campaignId: string) {
  return await db.campaign.findUnique({
    where: {
      id: campaignId,
      users: {
        some: {
          id: user.id,
        },
      },
    },
  });
}

export async function createUserCampaign(
  user: User,
  campaign: Omit<Campaign, "id" | "gmId" | "createdAt">
) {
  return await db.campaign.create({
    data: { ...campaign, gmId: user.id, users: { connect: [{ id: user.id }] } },
  });
}

export async function deleteUserCampaign(user: User, campaignId: string) {
  return await db.campaign.delete({
    where: {
      id: campaignId,
      gmId: user.id,
    },
  });
}
