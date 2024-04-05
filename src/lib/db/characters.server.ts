import type {
  Ability,
  CardData,
  Character,
  Dashboard,
  Effect,
  Item,
  NumericVariable,
  StringVariable
} from '@prisma/client';
import { db } from './db.server';
import { buildTree } from '$lib/GameSystem/Execution_tree';

export async function getCharacters(user_id: string) {
  return await db.character.findMany({
    where: {
      userId: user_id
    }
  });
}

export async function getCharactersInCampaign(user_id: string, campaignId: string) {
  return await db.character.findMany({
    where: {
      userId: user_id,
      Campaign_Character: { some: { campaignId: campaignId } }
    }
  });
}

export async function getCharactersNotInCampaign(user_id: string, campaignId: string) {
  return await db.character.findMany({
    where: {
      userId: user_id,
      Campaign_Character: { none: { campaignId: campaignId } }
    }
  });
}

export async function getCharacter(user_id: string, character_id: string, campaignId?: string) {
  return await db.character.findUnique({
    where: {
      id: character_id,
      userId: user_id,
      Campaign_Character: campaignId ? { some: { campaignId: campaignId } } : undefined
    },
    include: {
      Dashboard_Character: {
        include: {
          dashboard: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
}

export async function getCharacterDashboard(
  user_id: string,
  character_id: string,
  dashboard_id: string
) {
  return await db.dashboard.findUnique({
    where: {
      id: dashboard_id,
      userId: user_id,
      dashboard_character: {
        characterId: character_id
      }
    }
  });
}

export async function createCharacter(
  user_id: string,
  character: Pick<Character, 'name'> & {
    abilities: (Ability & {
      effects: Effect[];
    })[];
    items: (Item & {
      effects: Effect[];
    })[];
  },
  campaignId?: string
) {
  const tree = buildTree(character);
  tree.invoke();
  return await db.character.create({
    data: {
      name: character.name,
      userId: user_id,
      properties: tree.scope,
      abilities: {
        connect: character.abilities.map((ability) => ({ id: ability.id }))
      },
      items: {
        connect: character.items.map((item) => ({ id: item.id }))
      },
      Campaign_Character: campaignId
        ? {
            create: {
              campaignId: campaignId
            }
          }
        : undefined
    }
  });
}

export async function createCharacterFromCharacter(
  user_id: string,
  name: string,
  character: Character & {
    abilities: (Ability & {
      effects: Effect[];
    })[];
    items: (Item & {
      effects: Effect[];
    })[];
  },
  campaignId?: string
) {
  const tree = buildTree(character);
  tree.invoke();
  return await db.character.create({
    data: {
      name: name,
      userId: user_id,
      properties: tree.scope,
      abilities: {
        connect: character.abilities.map((ability) => ({ id: ability.id }))
      },
      items: {
        connect: character.items.map((item) => ({ id: item.id }))
      },
      Campaign_Character: campaignId
        ? {
            create: {
              campaignId: campaignId
            }
          }
        : undefined
    }
  });
}

export async function deleteCharacter(user_id: string, characterId: string, campaignId?: string) {
  return await db.character.delete({
    where: {
      userId: user_id,
      id: characterId,
      Campaign_Character: campaignId ? { some: { campaignId: campaignId } } : undefined
    }
  });
}

export async function addCharacterToCampaign(
  user_id: string,
  characterId: string,
  campaignId: string
) {
  return await db.campaign_Character.create({
    data: {
      character: {
        connect: {
          id: characterId,
          userId: user_id
        }
      },
      campaign: {
        connect: {
          id: campaignId,
          Campaign_User: {
            some: {
              userId: user_id
            }
          }
        }
      }
    }
  });
}

export async function removeCharacterFromCampaign(
  user_id: string,
  characterId: string,
  campaignId: string
) {
  return await db.campaign_Character.delete({
    where: {
      characterId_campaignId: {
        characterId: characterId,
        campaignId: campaignId
      },
      character: {
        userId: user_id
      },
      campaign: {
        Campaign_User: {
          some: {
            userId: user_id
          }
        }
      }
    }
  });
}

