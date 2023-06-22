import type { Heading } from "@prisma/client";
import type { Root } from "mdast";
import type { Writable } from "svelte/store";

export type WritableOf<T> = T extends Writable<infer U> ? U : never;

export const context = {
  pages: Symbol("pages"),
};

export namespace ContextType {
  export type pages = Writable<
    Map<
      string,
      {
        page: Promise<{
          hash: string;
          headings: (Omit<Heading, "index"> & {
            viewers: string[];
            modifiers: string[];
          })[];
          tree: Root;
          user_id: string;
          gm_id: string;
        }>;
        editing: boolean;
      }
    >
  >;
}
