import type { User } from "@prisma/client";
import { db } from "./db.server";
export async function getUserDashboardTemplates(user: User) {
  return await db.dashboardTemplate.findMany({ where: { userId: user.id } });
}

export async function getDashboardTemplate(user: User, templateId: string) {
  return await db.dashboardTemplate.findUnique({
    where: {
      id: templateId,
      userId: user.id,
    },
    include: {
      cards: true,
      numericVariables: true,
      stringVariables: true,
    },
  });
}

export async function deleteDashboardTemplate(user: User, templateId: string) {
  return await db.dashboardTemplate.delete({
    where: {
      id: templateId,
      userId: user.id,
    },
  });
}
