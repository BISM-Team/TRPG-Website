import type { ComponentProps } from "svelte";
import type { CardType } from "@prisma/client";
import Text, { Type } from "./Text.svelte";
import Other from "./Other.svelte";
import Healthbar from "./Healthbar.svelte";

export const map: {
  [Type in CardType]: {
    component: any;
    props: { [key: string]: any };
  };
} = {
  text: {
    component: Text,
    props: {
      type: {
        type: "enum",
        enum: Type,
      },
      source: "",
    } satisfies ComponentProps<Text>,
  },
  other: {
    component: Other,
    props: {
      url: "",
      zoom: 1,
      obj: {
        first: "",
        second: true,
      },
      arr: [""],
      char_arr: [
        {
          name: "",
          property: "PASS_PERC",
        },
      ],
    } satisfies ComponentProps<Other>,
  },
  healthbar: {
     component: Healthbar,
     props: {
     }, 
  }
};
