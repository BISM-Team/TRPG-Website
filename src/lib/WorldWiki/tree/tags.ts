import type { TextDirective } from "mdast-util-directive";
import { allowed_page_names_with_anchor_regex } from "../constants";
import type { PhrasingContent } from "mdast";
import { capitalizeFirstLetter } from "$lib/utils";

export function isTagsDirective(node: PhrasingContent): TextDirective | null {
  if (node.type === "textDirective" && node.name === "tags") return node;
  else return null;
}

export function getTags(node: TextDirective): string[] {
  if (node.children.length > 0) {
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
