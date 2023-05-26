import type { Ability, Character, Effect, Item } from "@prisma/client";
import { db } from "./db.server";
import { buildTree } from "$lib/GameSystem/Execution_tree";

export async function getCharacters(user_id: string) {
  return await db.user.findUnique({
    where: { id: user_id },
    select: {
      Character: true,
    },
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
      dashboard: dashboard,
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
