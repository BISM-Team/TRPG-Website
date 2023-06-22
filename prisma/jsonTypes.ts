import type { Root } from "mdast";

declare global {
  namespace PrismaJson {
    type PrismaRoot = Root;

    type WikiTree = {
      name: "root";
      viewers: ["all"];
      modifiers: ["all"];
      children: WikiTreeNode[];
    };

    type WikiTreeNode = {
      name: string;
      viewers: string[];
      modifiers: string[];
      children: WikiTreeNode[];
    };

    type NonNullJson = string | number | boolean | symbol | bigint | object;
  }
}
