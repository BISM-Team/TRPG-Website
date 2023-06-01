import type { ComponentType } from "svelte";
import Text from "./Text.svelte";
import type { CardType } from "@prisma/client";
import Other from "./Other.svelte";

export const map: { [Type in CardType]: ComponentType } = {
  text: Text,
  other: Other,
};
