import type { Root } from "mdast";
import type { Heading } from "mdast";
import type { Heading as DbHeading } from "@prisma/client";
import { type Matcher, defaultMatcher } from "mdast-util-inject";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { getHeadingViewers } from "./visibility";
import { getHeadingModifiers } from "./modifications";

export interface AdvancedHeading extends Heading {
  attributes?: Record<string, string | null | undefined> | null | undefined;
}

export function getHeadingId(heading: AdvancedHeading) {
  if (heading.attributes && heading.attributes.id) {
    return heading.attributes.id;
  } else return null;
}

export function searchHeadingIndex(
  tree: Root,
  searchText: string,
  matcher: Matcher = defaultMatcher
): number {
  for (let index = 0; index < tree.children.length; index++) {
    const child = tree.children[index];
    if (
      child.type === "heading" &&
      matcher(
        toString(child).trim().toLowerCase(),
        searchText.trim().toLowerCase()
      )
    ) {
      return index;
    }
  }
  return -1;
}

export function searchHeading(
  tree: Root,
  searchText: string,
  matcher: Matcher = defaultMatcher
): AdvancedHeading | undefined {
  for (let index = 0; index < tree.children.length; index++) {
    const child = tree.children[index];
    if (
      child.type === "heading" &&
      matcher(
        toString(child).trim().toLowerCase(),
        searchText.trim().toLowerCase()
      )
    ) {
      return child;
    }
  }
  return undefined;
}

export function searchHeadingIndexById(tree: Root, id: string): number {
  for (let index = 0; index < tree.children.length; index++) {
    const child = tree.children[index] as AdvancedHeading;
    if (
      child.type === "heading" &&
      child.attributes &&
      child.attributes.id &&
      child.attributes.id === id
    ) {
      return index;
    }
  }
  return -1;
}

export function searchHeadingById(
  tree: Root,
  id: string
): AdvancedHeading | undefined {
  for (let index = 0; index < tree.children.length; index++) {
    const child = tree.children[index] as AdvancedHeading;
    if (
      child.type === "heading" &&
      child.attributes &&
      child.attributes.id &&
      child.attributes.id === id
    ) {
      return child;
    }
  }
  return undefined;
}

export function getHeadings(tree: Root): AdvancedHeading[] {
  const headings: AdvancedHeading[] = [];
  visit(tree, "heading", (node) => {
    const advHeading = node as AdvancedHeading;
    headings.push(advHeading);
  });
  return headings;
}

export function getHeadingsDb(
  tree: Root,
  page_name: string,
  campaignId: string
): (DbHeading & { viewers: string[]; modifiers: string[] })[] {
  const headings: (DbHeading & { viewers: string[]; modifiers: string[] })[] =
    [];
  visit(tree, "heading", (node, i) => {
    const advHeading = node as AdvancedHeading;
    if (advHeading.attributes && advHeading.attributes.id && i !== null) {
      headings.push({
        pageCampaignId: campaignId,
        pageName: page_name,
        id: advHeading.attributes.id,
        text: stripHash(toString(advHeading)).result,
        level: Number(advHeading.depth),
        index: i,
        viewers: getHeadingViewers(advHeading),
        modifiers: getHeadingModifiers(advHeading),
      });
    }
  });
  return headings;
}

export function stripHash(str: string): {
  result: string;
  depth: 1 | 2 | 3 | 4 | 5 | 6;
} {
  let n = 1 as 1 | 2 | 3 | 4 | 5 | 6;
  let first = true;
  while (str.length && str[0] === "#") {
    str = str.slice(1);
    if (!first && n < 6) n += 1;
    if (first) first = false;
  }
  return { result: str.trimStart(), depth: n };
}

export function addHash(
  str: string,
  depth: (1 | 2 | 3 | 4 | 5 | 6) | number
): string {
  return "#".repeat(depth) + " " + str;
}

export function getFirstHeadingIndexAfter(
  tree: Root,
  startIndex: number
): number {
  for (let index = startIndex + 1; index < tree.children.length; index++) {
    const child = tree.children[index];
    if (child.type === "heading") return index;
  }
  return -1;
}
