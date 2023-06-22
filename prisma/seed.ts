import {
  PrismaClient,
  type Ability,
  type Effect,
  type Item,
  type User,
} from "@prisma/client";

const db = new PrismaClient();

const PrepareSpells: Omit<Ability, "id"> & {
  effects: Omit<Effect, "id" | "itemId" | "abilityId">[];
} = {
  name: "Prepare Spells",
  effects: [
    {
      fn: `
      scope['preparable_spells'] = 0; 
      scope['stat'] = 3;`,
      modifies: "preparable_spells stat",
      reads: "",
      priority: 0,
    },
    {
      fn: `scope["preparable_spells"] =
          scope["level"] +
          scope["INT"] +
          scope["DEX"];`,
      modifies: "preparable_spells",
      reads: "level INT",
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
      fn: `scope["level"] = 2;
      scope["INT"] = 3;
      scope["CAR"] = 0;
      scope["DEX"] = 2;`,
      modifies: "level INT CAR DEX",
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
      fn: `scope["INT"] = scope["CAR"] + 2`,
      modifies: "INT",
      reads: "CAR",
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
      fn: `scope["CAR"] = scope["stat"]`,
      modifies: "CAR",
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
      fn: `scope["preparable_spells"] += 2`,
      modifies: "preparable_spells",
      reads: "preparable_spells",
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
      fn: `scope["preparable_spells"] *= 2`,
      modifies: "preparable_spells",
      reads: "preparable_spells",
      priority: 1,
    },
  ],
};

const all_user: Omit<User, "createdAt"> = {
  id: "all",
  name: "all",
  email: "",
  password: "",
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

  await db.user.upsert({
    where: {
      id: all_user.id,
      email: all_user.email,
    },
    create: all_user,
    update: all_user,
  });
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
