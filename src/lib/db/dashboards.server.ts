import type {
  CardData,
  NumericVariable,
  StringVariable,
  Campaign,
  Prisma,
  DashboardType,
  Character
} from '@prisma/client';
import { db } from './db.server';

export async function getUserDashboards(user_id: string) {
  return await db.dashboard.findMany({
    where: { userId: user_id }
  });
}

export async function getDashboard(user_id: string, dashboardId: string) {
  return await db.dashboard.findUnique({
    where: {
      id: dashboardId,
      userId: user_id
    },
    include: {
      numericVariables: true,
      stringVariables: true,
      cards: {
        orderBy: {
          index: 'asc'
        }
      },
      dashboard_character: {
        include: {
          character: true
        }
      },
      dashboard_campaign: {
        include: {
          campaign: true
        }
      }
    }
  });
}

export async function createDashboard(
  user_id: string,
  name: string,
  type: DashboardType,
  isDefault: boolean,
  target:
    | { campaign: Campaign; character: undefined }
    | { campaign: undefined; character: Character }
) {
  const creation = target.campaign
    ? {
        dashboard_campaign: {
          create: {
            userId: user_id,
            campaignId: target.campaign.id,
            default: isDefault
          }
        }
      }
    : {
        dashboard_character: {
          create: {
            characterId: target.character.id,
            default: isDefault
          }
        }
      };

  return await db.dashboard.create({
    data: {
      name: name,
      ...creation,
      userId: user_id,
      type: type,
      numericVariables: {
        create: []
      },
      stringVariables: {
        create: []
      },
      cards: {
        create: []
      }
    }
  });
}

export async function deleteDashboard(user_id: string, dashboardId: string) {
  return await db.dashboard.delete({
    where: {
      id: dashboardId,
      userId: user_id
    }
  });
}

export async function createCard(
  user_id: string,
  dashboardId: string,
  cardData: Prisma.CardDataCreateWithoutDashboardInput
) {
  return await db.dashboard.update({
    where: { userId: user_id, id: dashboardId },
    data: {
      cards: {
        create: cardData
      }
    },
    include: {
      numericVariables: true,
      stringVariables: true,
      cards: {
        orderBy: {
          index: 'asc'
        }
      }
    }
  });
}

export async function updateCards(
  user_id: string,
  dashboardId: string,
  cards: CardData[],
  removedCards: string[]
) {
  const _cards = cards.map((card) => {
    const { dashboardId, ...card_with_id } = card;
    return card_with_id;
  });
  return await db.dashboard.update({
    where: { userId: user_id, id: dashboardId },
    include: {
      cards: true,
      numericVariables: true,
      stringVariables: true
    },
    data: {
      cards: {
        upsert: _cards.map((card) => {
          return {
            where: {
              id: card.id
            },
            create: card,
            update: card
          };
        }),
        deleteMany: {
          id: {
            in: removedCards
          }
        }
      }
    }
  });
}

export async function updateDashboard(
  user_id: string,
  dashboardId: string,
  name: string,
  numVars: NumericVariable[],
  strVars: StringVariable[],
  removedNumVars: string[],
  removedStrVars: string[],
  type: DashboardType
) {
  const _numVars = numVars.map((variable) => {
    const { dashboardId, ...variable_with_id } = variable;
    return variable_with_id;
  });
  const _strVars = strVars.map((variable) => {
    const { dashboardId, ...variable_with_id } = variable;
    return variable_with_id;
  });
  return await db.dashboard.update({
    where: { userId: user_id, id: dashboardId },
    include: {
      cards: true,
      numericVariables: true,
      stringVariables: true
    },
    data: {
      name: name,
      type: type,
      numericVariables: {
        upsert: _numVars.map((variable) => ({
          where: {
            id: variable.id
          },
          create: variable,
          update: variable
        })),
        deleteMany: {
          id: {
            in: removedNumVars
          }
        }
      },
      stringVariables: {
        upsert: _strVars.map((variable) => ({
          where: {
            id: variable.id
          },
          create: variable,
          update: variable
        })),
        deleteMany: {
          id: {
            in: removedStrVars
          }
        }
      }
    }
  });
}

export async function removeCard(user_id: string, dashboardId: string, cardId: string) {
  return await db.dashboard.update({
    where: { userId: user_id, id: dashboardId },
    data: {
      cards: {
        delete: { id: cardId }
      }
    },
    include: {
      cards: true,
      numericVariables: true,
      stringVariables: true
    }
  });
}

