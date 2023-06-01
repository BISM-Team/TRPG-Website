import type { ComponentProps, ComponentType } from "svelte";
import Text from "./Text.svelte";
import type { CardType } from "@prisma/client";
import Other from "./Other.svelte";

export const map: {
  [Type in CardType]: {
    component: ComponentType;
    props: { [key: string]: any };
  };
} = {
  text: {
    component: Text,
    props: {
      source: "",
    } satisfies ComponentProps<Text>,
  },
  other: {
    component: Other,
    props: {
      url: "",
      zoom: 1,
    } satisfies ComponentProps<Other>,
  },
};
