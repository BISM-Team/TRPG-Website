import type {
  CardData,
  Dashboard,
  NumericVariable,
  StringVariable,
  User,
  Campaign,
  Prisma,
} from "@prisma/client";
import { db } from "./db.server";

export async function getUserDashboards(user: User, campaignId: string) {
  return await db.dashboard.findMany({
    where: { userId: user.id, campaignId: campaignId },
  });
}

export async function getDashboard(
  user: User,
  campaignId: string,
  dashboardId: string
) {
  return await db.dashboard.findUnique({
    where: {
      id: dashboardId,
      campaignId: campaignId,
      userId: user.id,
    },
    include: {
      numericVariables: true,
      stringVariables: true,
      cards: {
        orderBy: {
          index: "asc",
        },
      },
    },
  });
}

export async function createDashboard(
  user: User,
  campaign: Campaign,
  dashboard: Omit<Dashboard, "id" | "userId" | "campaignId"> & {
    numericVariables: Omit<NumericVariable, "id">[];
    stringVariables: Omit<StringVariable, "id">[];
    cards: Omit<CardData, "id">[];
  }
) {
  return await db.dashboard.create({
    data: {
      name: dashboard.name,
      templateId: dashboard.templateId,
      campaignId: campaign.id,
      userId: user.id,
      numericVariables: {
        create: dashboard.numericVariables,
      },
      stringVariables: {
        create: dashboard.stringVariables,
      },
      cards: {
        create: dashboard.cards,
      },
    },
  });
}

export async function deleteDashboard(
  user: User,
  campaignId: string,
  dashboardId: string
) {
  return await db.dashboard.delete({
    where: {
      id: dashboardId,
      campaignId: campaignId,
      userId: user.id,
    },
  });
}

export async function createCard(
  user: User,
  dashboardId: string,
  cardData: Prisma.CardDataCreateWithoutDashboardInput
) {
  return await db.dashboard.update({
    where: { userId: user.id, id: dashboardId },
    data: {
      cards: {
        create: cardData,
      },
    },
    include: {
      numericVariables: true,
      stringVariables: true,
      cards: {
        orderBy: {
          index: "asc",
        },
      },
    },
  });
}

export async function updateCards(
  user: User,
  dashboardId: string,
  cards: CardData[],
  removed: string[]
) {
  const _cards = cards.map((card) => {
    const { dashboardId, ...card_with_id } = card;
    return card_with_id;
  });
  return await db.dashboard.update({
    where: { userId: user.id, id: dashboardId },
    data: {
      cards: {
        upsert: _cards.map((card) => ({
          where: {
            id: card.id,
          },
          create: card,
          update: card,
        })),
        deleteMany: {
          id: {
            in: removed,
          },
        },
      },
    },
  });
}

export async function removeCard(
  user: User,
  dashboardId: string,
  cardId: string
) {
  return await db.dashboard.update({
    where: { userId: user.id, id: dashboardId },
    data: {
      cards: {
        delete: { id: cardId },
      },
    },
    include: {
      cards: true,
      numericVariables: true,
      stringVariables: true,
    },
  });
}
