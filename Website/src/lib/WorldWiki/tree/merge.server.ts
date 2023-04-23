import type { Root } from "mdast";
import { getHeadingModifiability } from "./modifications";
import {
  searchHeadingIndexById,
  type AdvancedHeading,
  getHeadings,
} from "./heading";
import { getHeadingVisibility } from "./visibility";
import { includes } from "$lib/utils";

export function mergeTrees(
  left: Root,
  right: Root,
  user_id: string,
  gm_id: string
): Root {
  const left_headings = getHeadings(left);
  const right_headings = getHeadings(right);
  const resulting_headings: (AdvancedHeading & { left: boolean })[] = [];
  const new_tree: Root = { type: "root", children: [] };

  for (let depth = 1; depth < 6; depth++) {
    let previous_level_heading: number = -1;
    let last_added_index: number = -1;
    for (let i = 0; i < left_headings.length; ++i) {
      const heading = left_headings[i];
      if (heading.depth < depth) {
        previous_level_heading = resulting_headings.findIndex((_heading) => {
          return _heading.attributes?.id === heading.attributes?.id;
        });
      } else if (
        heading.depth === depth &&
        (previous_level_heading >= 0 || depth === 1) &&
        (!getHeadingModifiability(heading, user_id, gm_id) ||
          !getHeadingVisibility(heading, user_id, gm_id))
      ) {
        const obj = { ...heading, left: true };
        if (depth === 1) resulting_headings.push(obj);
        else {
          last_added_index =
            Math.max(previous_level_heading, last_added_index) + 1;
          resulting_headings.splice(last_added_index, 0, obj);
        }
      }
    }
    previous_level_heading = -1;
    last_added_index = -1;
    for (let i = 0; i < right_headings.length; ++i) {
      const heading = right_headings[i];
      if (heading.depth < depth) {
        previous_level_heading = resulting_headings.findIndex((_heading) => {
          return _heading.attributes?.id === heading.attributes?.id;
        });
      } else if (
        heading.depth === depth &&
        (previous_level_heading >= 0 || depth === 1) &&
        !includes(resulting_headings, heading, (first, second) => {
          return first.attributes?.id === second.attributes?.id;
        })
      ) {
        const obj = { ...heading, left: false };
        if (depth === 1) resulting_headings.push(obj);
        else {
          last_added_index =
            Math.max(previous_level_heading, last_added_index) + 1;
          resulting_headings.splice(last_added_index, 0, obj);
        }
      }
    }
  }

  for (const heading of resulting_headings) {
    const id = heading.attributes?.id;
    if (id) {
      const index = searchHeadingIndexById(heading.left ? left : right, id);
      if (index === -1)
        throw new Error("Heading not found during merge finalization");
      insertUntilNextHeading(heading.left ? left : right, new_tree, index);
    } else
      console.warn("Heading without id during merge finalization, skipping...");
  }

  return new_tree;
}

function insertUntilNextHeading(src: Root, dest: Root, index: number) {
  let first = true;
  while (
    index !== src.children.length &&
    (first || src.children[index].type !== "heading")
  ) {
    dest.children.push(src.children[index]);
    first = false;
    index++;
  }
}
