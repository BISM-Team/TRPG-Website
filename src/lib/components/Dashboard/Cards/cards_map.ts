import type { ComponentProps, ComponentType, SvelteComponent } from "svelte";
import type { CardType } from "@prisma/client";
import Healthbar from "./Healthbar.svelte";
import Page from "./Page.svelte";
import Property from "./Property.svelte";

type Props<T extends SvelteComponent> = Omit<ComponentProps<T>, "dashboard">;

export const map: {
  [Type in CardType]: {
    component: ComponentType;
    props: any;
  };
} = {
  page: {
    component: Page,
    props: {
      source: "",
    } satisfies Props<Page>,
  },
  property: {
    component: Property,
    props: {
      source: "",
    } satisfies Props<Property>,
  },
  healthbar: {
    component: Healthbar,
    props: {} satisfies Props<Healthbar>,
  },
};
