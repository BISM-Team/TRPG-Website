import type { Root } from "mdast";

declare global {
  namespace PrismaJson {
    type PrismaRoot = Root;
    type WikiTreeNode = {
      name: string;
      children: WikiTreeNode[];
    };
    type NonNullJson = string | number | boolean | symbol | bigint | object;
  }
}
