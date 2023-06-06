import type { ComponentProps } from "svelte";
import Text from "./Text.svelte";
import type { CardType } from "@prisma/client";
import Other from "./Other.svelte";
import Who_This from "./Who_This.svelte";

export const map: {
  [Type in CardType]: {
    component: any;
    props: { [key: string]: any };
  };
} = {
  text: {
    component: Text,
    props: {
      source: "",
      active: false,
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
  who_this: {
     component: Who_This,
     props: {
     }, 
  }
};
