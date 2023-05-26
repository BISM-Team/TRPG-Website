import {
  PrismaClient,
  type Ability,
  type Effect,
  type Item,
} from "@prisma/client";

const db = new PrismaClient();

const PrepareSpells: Omit<Ability, "id"> & {
  effects: Omit<Effect, "id" | "itemId" | "abilityId">[];
} = {
  name: "Prepare Spells",
  effects: [
    {
      fn: `
      scope['character.preparable_spells'] = 0; 
      scope['stat'] = 3;`,
      modifies: "character.preparable_spells stat",
      reads: "",
      priority: 0,
    },
    {
      fn: `scope["character.preparable_spells"] =
          scope["character.level"] +
          scope["character.INT"] +
          scope["character.DEX"];`,
      modifies: "character.preparable_spells",
      reads: "character.level character.INT",
      priority: 0,
    },
  ],
};

const character_def: Omit<Ability, "id"> & {
  effects: Omit<Effect, "id" | "itemId" | "abilityId">[];
} = {
  name: "Character Definition",
  effects: [
    {
      fn: `scope["character.level"] = 2;
      scope["character.INT"] = 3;
      scope["character.CAR"] = 0;
      scope["character.DEX"] = 2;`,
      modifies: "character.level character.INT character.CAR character.DEX",
      reads: "",
      priority: 0,
    },
  ],
};

const nonsense_effect: Omit<Ability, "id"> & {
  effects: Omit<Effect, "id" | "itemId" | "abilityId">[];
} = {
  name: "no-sense effect",
  effects: [
    {
      fn: `scope["character.INT"] = scope["character.CAR"] + 2`,
      modifies: "character.INT",
      reads: "character.CAR",
      priority: 0,
    },
  ],
};

const nonsense_effect_2: Omit<Ability, "id"> & {
  effects: Omit<Effect, "id" | "itemId" | "abilityId">[];
} = {
  name: "no-sense effect 2",
  effects: [
    {
      fn: `scope["character.CAR"] = scope["stat"]`,
      modifies: "character.CAR",
      reads: "stat",
      priority: 0,
    },
  ],
};

const prep_modifier: Omit<Item, "id"> & {
  effects: Omit<Effect, "id" | "itemId" | "abilityId">[];
} = {
  name: "Spellcaster's tome",
  effects: [
    {
      fn: `scope["character.preparable_spells"] += 2`,
      modifies: "character.preparable_spells",
      reads: "character.preparable_spells",
      priority: 0,
    },
  ],
};

const prep_modifier_2: Omit<Item, "id"> & {
  effects: Omit<Effect, "id" | "itemId" | "abilityId">[];
} = {
  name: "Spellcaster's Wand",
  effects: [
    {
      fn: `scope["character.preparable_spells"] *= 2`,
      modifies: "character.preparable_spells",
      reads: "character.preparable_spells",
      priority: 1,
    },
  ],
};

async function main() {
  await db.ability.deleteMany({});
  await db.item.deleteMany({});

  await Promise.all(
    [PrepareSpells, character_def, nonsense_effect, nonsense_effect_2].map(
      async (ability) => {
        await db.ability.upsert({
          where: { name: ability.name },
          create: {
            name: ability.name,
            effects: {
              createMany: {
                data: ability.effects,
              },
            },
          },
          update: {
            effects: {
              deleteMany: {},
              createMany: {
                data: ability.effects,
              },
            },
          },
        });
      }
    )
  );

  await Promise.all(
    [prep_modifier, prep_modifier_2].map(async (item) => {
      await db.item.upsert({
        where: { name: item.name },
        create: {
          name: item.name,
          effects: {
            createMany: {
              data: item.effects,
            },
          },
        },
        update: {
          effects: {
            deleteMany: {},
            createMany: {
              data: item.effects,
            },
          },
        },
      });
    })
  );
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
