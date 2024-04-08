import type { Ability, Character, Effect, Item } from '@prisma/client';
import { db } from './db.server';
import { buildTree } from '$lib/GameSystem/Execution_tree';

export async function getCharacters(user_id: string) {
  return await db.character.findMany({
    where: {
      userId: user_id
    }
  });
}

export async function getCharacter(user_id: string, character_id: string) {
  return await db.character.findUnique({
    where: {
      id: character_id,
      userId: user_id
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
  }
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
      }
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
  }
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
      }
    }
  });
}

export async function deleteCharacter(user_id: string, characterId: string) {
  return await db.character.delete({
    where: {
      userId: user_id,
      id: characterId
    }
  });
}

