import { includes } from "$lib/utils";
import type { Root } from "mdast";
import type { AdvancedHeading } from "./heading";

export function getHeadingModifiers(node: AdvancedHeading) {
  if (node.attributes && node.attributes.modifiers) {
    return node.attributes.modifiers.split(";").map((modifier: string) => {
      return modifier.trim();
    });
  } else return [];
}

export function getHeadingModifiability(
  node: AdvancedHeading,
  user_id: string
): boolean {
  const low_user_id = user_id.trim();
  if (low_user_id === "gm") return true;
  if (node.attributes && node.attributes.modifiers) {
    const modifiers: string[] = node.attributes.modifiers
      .split(";")
      .map((modifier: string) => {
        return modifier.trim();
      });
    return includes(modifiers, low_user_id) || includes(modifiers, "all");
  } else return false;
}

export function isNodeModifiable(
  tree: Root,
  index: number,
  user_id: string
): boolean {
  let current_depth = 7;
  for (let i = index; 0 <= i && current_depth > 1; i -= 1) {
    const child = tree.children[i];
    if (child.type === "heading") {
      const heading = child as AdvancedHeading;
      if (child.depth >= current_depth) {
        continue;
      }
      if (getHeadingModifiability(heading, user_id)) {
        return true;
      }
      current_depth = child.depth;
    }
  }
  return false;
}
