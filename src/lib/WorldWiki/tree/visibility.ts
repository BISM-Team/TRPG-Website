import type { Root } from "mdast";
import { includes } from "$lib/utils";
import type { AdvancedHeading } from "./heading";

export function getHeadingViewers(node: AdvancedHeading) {
  if (node.attributes && node.attributes.viewers) {
    return node.attributes.viewers.split(";").map((viewer: string) => {
      return viewer;
    });
  } else return [];
}

export function getHeadingVisibility(
  node: AdvancedHeading,
  user_id: string,
  gm_id: string
): boolean {
  if (user_id === gm_id) return true;
  if (node.attributes && node.attributes.viewers) {
    const viewers: string[] = node.attributes.viewers
      .split(";")
      .map((viewer: string) => {
        return viewer;
      });
    return includes(viewers, user_id) || includes(viewers, "all");
  } else return false;
}

export function isNodeVisible(
  tree: Root,
  index: number,
  user_id: string,
  gm_id: string
): boolean {
  let current_depth = 7;
  for (let i = index; 0 <= i && current_depth > 1; i -= 1) {
    const child = tree.children[i];
    if (child.type === "heading") {
      const heading = child as AdvancedHeading;
      if (heading.depth >= current_depth) {
        continue;
      }
      if (!getHeadingVisibility(heading, user_id, gm_id)) {
        return false;
      }
      current_depth = heading.depth;
    }
  }
  return true;
}
