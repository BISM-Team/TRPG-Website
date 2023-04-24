import { Ability, Effect, Item } from "./Classes";

export const PrepareSpells = new Ability("Prepare Spells", [
  new Effect(
    (scope: any) => {
      scope["character.preparable_spells"] = 0;
      scope["stat"] = 3;
    },
    ["character.preparable_spells", "stat"],
    []
  ),
  new Effect(
    (scope: any) => {
      scope["character.preparable_spells"] =
        scope["character.level"] +
        scope["character.INT"] +
        scope["character.DEX"];
    },
    ["character.preparable_spells"],
    ["character.level", "character.INT"]
  ),
]);

export const character_def = new Ability("Character Definition", [
  new Effect(
    (scope: any) => {
      scope["character.level"] = 2;
      scope["character.INT"] = 3;
      scope["character.CAR"] = 0;
      scope["character.DEX"] = 2;
    },
    ["character.level", "character.INT", "character.CAR", "character.DEX"],
    []
  ),
]);

export const nonsense_effect = new Ability("no-sense effect", [
  new Effect(
    (scope: any) => {
      scope["character.INT"] = scope["character.CAR"] + 2;
    },
    ["character.INT"],
    ["character.CAR"]
  ),
]);

export const nonsense_effect_2 = new Ability("no-sense effect 2", [
  new Effect(
    (scope: any) => {
      scope["character.CAR"] = scope["stat"];
    },
    ["character.CAR"],
    ["stat"]
  ),
]);

export const prep_modifier = new Item("Spellcaster's tome", [
  new Effect(
    (scope: any) => {
      scope["character.preparable_spells"] += 2;
    },
    ["character.preparable_spells"],
    ["character.preparable_spells"]
  ),
]);

export const prep_modifier_2 = new Item("Spellcaster's Wand", [
  new Effect(
    (scope: any) => {
      scope["character.preparable_spells"] *= 2;
    },
    ["character.preparable_spells"],
    ["character.preparable_spells"],
    1
  ),
]);
