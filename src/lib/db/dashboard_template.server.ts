import type { User } from "@prisma/client";
import { db } from "./db.server";
export async function getUserDashboardTemplates(user_id: string) {
  return await db.dashboardTemplate.findMany({ where: { userId: user_id } });
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
