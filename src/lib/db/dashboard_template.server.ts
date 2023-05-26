import type {
  Campaign,
  CardData,
  Dashboard,
  DashboardTemplate,
  NumericVariable,
  StringVariable,
  Type,
} from "@prisma/client";
import { db } from "./db.server";
export async function getUserDashboardTemplates(user_id: string, type?: Type) {
  return await db.dashboardTemplate.findMany({
    where: { userId: user_id, type: type },
  });
}

export async function getDashboardTemplate(
  user_id: string,
  templateId: string
) {
  return await db.dashboardTemplate.findUnique({
    where: {
      id: templateId,
      userId: user_id,
    },
    include: {
      cards: true,
      numericVariables: true,
      stringVariables: true,
    },
  });
}

export async function deleteDashboardTemplate(
  user_id: string,
  templateId: string
) {
  return await db.dashboardTemplate.delete({
    where: {
      id: templateId,
      userId: user_id,
    },
  });
}

export async function createDashboardFromTemplate(
  user_id: string,
  name: string,
  dashboardTemplate: DashboardTemplate & {
    numericVariables: NumericVariable[];
    stringVariables: StringVariable[];
    cards: CardData[];
  },
  campaign?: Campaign
) {
  return await db.dashboard.create({
    data: {
      name: name,
      campaignId: campaign?.id,
      userId: user_id,
      type: dashboardTemplate.type,
      numericVariables: {
        create: dashboardTemplate.numericVariables.map((variable) => {
          const { id, dashboardId, templateId, ...rest } = variable;
          return rest;
        }),
      },
      stringVariables: {
        create: dashboardTemplate.stringVariables.map((variable) => {
          const { id, dashboardId, templateId, ...rest } = variable;
          return rest;
        }),
      },
      cards: {
        create: dashboardTemplate.cards.map((card) => {
          const { id, dashboardId, templateId, ...rest } = card;
          return rest;
        }),
      },
    },
  });
}

type TemplateDashboardOptions = {
  cards: boolean;
  numericVariables: boolean;
  stringVariables: boolean;
};

export async function loadTemplateToDashboard(
  user_id: string,
  dashboardId: string,
  dashboardTemplate: DashboardTemplate & {
    numericVariables: NumericVariable[];
    stringVariables: StringVariable[];
    cards: CardData[];
  },
  options: TemplateDashboardOptions,
  campaign_id?: string
) {
  return await db.dashboard.update({
    where: { id: dashboardId, campaignId: campaign_id, userId: user_id },
    data: {
      type: dashboardTemplate.type,
      numericVariables: options.numericVariables
        ? {
            deleteMany: {},
            create: dashboardTemplate.numericVariables.map((variable) => {
              const { id, dashboardId, templateId, ...rest } = variable;
              return rest;
            }),
          }
        : undefined,
      stringVariables: options.stringVariables
        ? {
            deleteMany: {},
            create: dashboardTemplate.stringVariables.map((variable) => {
              const { id, dashboardId, templateId, ...rest } = variable;
              return rest;
            }),
          }
        : undefined,
      cards: options.cards
        ? {
            deleteMany: {},
            create: dashboardTemplate.cards.map((card) => {
              const { id, dashboardId, templateId, ...rest } = card;
              return rest;
            }),
          }
        : undefined,
    },
  });
}

export async function saveDashboardToTemplate(
  user_id: string,
  name: string,
  templateId: string,
  dashboard: Dashboard & {
    numericVariables: NumericVariable[];
    stringVariables: StringVariable[];
    cards: CardData[];
  },
  options: TemplateDashboardOptions
) {
  return await db.dashboardTemplate.upsert({
    where: { userId: user_id, id: templateId, name: name },
    update: {
      type: dashboard.type,
      numericVariables: options.numericVariables
        ? {
            deleteMany: {},
            create: dashboard.numericVariables.map((variable) => {
              const { id, dashboardId, templateId, ...rest } = variable;
              return rest;
            }),
          }
        : undefined,
      stringVariables: options.stringVariables
        ? {
            deleteMany: {},
            create: dashboard.stringVariables.map((variable) => {
              const { id, dashboardId, templateId, ...rest } = variable;
              return rest;
            }),
          }
        : undefined,
      cards: options.cards
        ? {
            deleteMany: {},
            create: dashboard.cards.map((card) => {
              const { id, dashboardId, templateId, ...rest } = card;
              return rest;
            }),
          }
        : undefined,
    },
    create: {
      name: name,
      userId: user_id,
      type: dashboard.type,
      numericVariables: options.numericVariables
        ? {
            create: dashboard.numericVariables.map((variable) => {
              const { id, dashboardId, templateId, ...rest } = variable;
              return rest;
            }),
          }
        : { create: [] },
      stringVariables: options.stringVariables
        ? {
            create: dashboard.stringVariables.map((variable) => {
              const { id, dashboardId, templateId, ...rest } = variable;
              return rest;
            }),
          }
        : { create: [] },
      cards: options.cards
        ? {
            create: dashboard.cards.map((card) => {
              const { id, dashboardId, templateId, ...rest } = card;
              return rest;
            }),
          }
        : { create: [] },
    },
  });
}
