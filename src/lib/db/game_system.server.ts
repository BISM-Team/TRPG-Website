import type { Ability, Character, Effect, Item } from "@prisma/client";
import { db } from "./db.server";
import { buildTree } from "$lib/GameSystem/Execution_tree";

export async function getCharacters(user_id: string) {
  return await db.character.findMany({
    where: { userId: user_id },
  });
}

export async function getCharacter(
  user_id: string,
  character_id: string,
  dashboard: boolean
) {
  return await db.character.findUnique({
    where: { id: character_id, userId: user_id },
    include: {
      dashboard: dashboard
        ? {
            include: {
              cards: true,
              stringVariables: true,
              numericVariables: true,
            },
          }
        : undefined,
    },
  });
}

export async function createCharacter(
  user_id: string,
  dashboardId: string,
  character: Pick<Character, "name"> & {
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
      dashboardId: dashboardId,
      abilities: {
        connect: character.abilities.map((ability) => ({ id: ability.id })),
      },
      items: {
        connect: character.items.map((item) => ({ id: item.id })),
      },
    },
  });
}

export async function deleteCharacter(user_id: string, characterId: string) {
  return await db.character.delete({
    where: {
      userId: user_id,
      id: characterId,
    },
  });
}
