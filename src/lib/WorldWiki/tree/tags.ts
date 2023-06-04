import type { TextDirective } from "mdast-util-directive";
import { allowed_page_names_with_anchor_regex } from "../constants";
import type { PhrasingContent, Root } from "mdast";
import inject from "mdast-util-inject";
import { capitalizeFirstLetter } from "$lib/utils";
import { parseSource } from "./tree";
import { getFirstHeadingIndexAfter, searchHeadingIndex } from "./heading";

export function isTagsDirective(node: PhrasingContent): TextDirective | null {
  if (node.type === "textDirective" && node.name === "tags") return node;
  else return null;
}

export function getTags(node: TextDirective): string[] {
  if (node.children) {
    const text_child = node.children[0];
    if (text_child.type === "text") {
      return text_child.value.match(allowed_page_names_with_anchor_regex) || [];
    }
  }
  return [];
}

export function makeTagHeadingDirective(
  tagName: string,
  attributes?: { id?: string; viewers?: string; modifiers?: string }
) {
  const id = attributes && attributes.id ? "#" + attributes.id + " " : "";
  const viewers =
    attributes && attributes.viewers
      ? "viewers='" + attributes.viewers + "' "
      : "";
  const modifiers =
    attributes && attributes.modifiers
      ? "modifiers='" + attributes.modifiers + "' "
      : "";
  const attributes_str =
    id || viewers || modifiers ? "{" + id + viewers + modifiers + "}" : "";
  return `::heading[# ${capitalizeFirstLetter(tagName)}]${attributes_str}`;
}

export async function ensureTagSectionExists(
  tag_heading: string,
  tree: Root,
  attributes?: { id?: string; viewers?: string; modifiers?: string }
) {
  const index = searchHeadingIndex(tree, capitalizeFirstLetter(tag_heading));
  if (index === -1) {
    inject(
      "",
      tree,
      await parseSource(makeTagHeadingDirective(tag_heading, attributes))
    );
  }
  return index;
}

function findTag(tree: Root, start_index: number, end_index: number) {
  for (let index = start_index; index < end_index; index++) {
    const child = tree.children[index];
    if (child.type === "textDirective" && child.name === "tags") {
      return child;
    }
  }
  return null;
}

export async function inject_tag(
  tag_section: string,
  tree: Root,
  to_inject: string
) {
  const index = await ensureTagSectionExists(tag_section, tree);
  let last_index = getFirstHeadingIndexAfter(tree, index);
  last_index = last_index === -1 ? tree.children.length : last_index;
}

export async function update_tag(
  tag_heading: string,
  tree: Root,
  prev_name: string,
  new_name: string
) {}
