import type {
    CardData,
    Dashboard,
    NumericVariable,
    StringVariable,
    User,
    Prisma,
} from "@prisma/client";
import { db } from "./db.server";

export async function getUserDashboards(user: User) {
    return await db.dashboard.findMany({ where: { userId: user.id } });
}

export async function getDashboard(user: User, dashboardId: string) {
    return await db.dashboard.findUnique({
        where: {
            id: dashboardId,
            userId: user.id,
        },
        include: {
            cards: true,
            numericVariables: true,
            stringVariables: true,
        },
    });
}

export async function createDashboard(
    user: User,
    dashboard: Omit<Dashboard, "id" | "userId"> & {
        numericVariables: Omit<NumericVariable, "id">[];
        stringVariables: Omit<StringVariable, "id">[];
        cards: Omit<CardData, "id">[];
    }
) {
    return await db.dashboard.create({
        data: {
            name: dashboard.name,
            templateId: dashboard.templateId,
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

export async function deleteDashboard(user: User, dashboardId: string) {
    return await db.dashboard.delete({
        where: {
            id: dashboardId,
            userId: user.id,
        },
    });
}

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
            cards: true,
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
