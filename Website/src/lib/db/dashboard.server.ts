import type { CardData, Dashboard, NumericVariable, StringVariable, User } from '@prisma/client'
import { db } from './db.server'

export async function getUserDashboards(user: User) : Promise<Dashboard[]> {
    return await db.dashboard.findMany({ where: { userId: user.id }});
}

export async function getDashboard(user: User, dashboardId: string) {
    return await db.dashboard.findUnique({ where: { id: dashboardId, userId: user.id }, include: { cards: true, numericVariables: true, stringVariables: true }});
}

export async function createDashboard(dashboard: Omit<Dashboard, 'id'> & {numericVariables: Omit<NumericVariable, 'id'>[], stringVariables: Omit<StringVariable, 'id'>[], cards: Omit<CardData, 'id'>[]}) {
    return await db.dashboard.create({
        data: {
            name: dashboard.name,
            templateId: dashboard.templateId,
            userId: dashboard.userId,
            numericVariables: {
                create: dashboard.numericVariables
            },
            stringVariables: {
                create: dashboard.stringVariables
            },
            cards: {
                create: dashboard.cards
            }
        }
    });
}

export async function getDashboardTemplate(user: User, templateId: string) {
    return await db.dashboardTemplate.findUnique({ where: { id: templateId, userId: user.id }, include: { cards: true, numericVariables: true, stringVariables: true }});
}