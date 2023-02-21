import type { TextDirective } from "mdast-util-directive";
import { allowed_page_names_with_anchor_regex } from "../constants";
import type { PhrasingContent } from "mdast";

export function isTagsDirective(node: PhrasingContent) : TextDirective | null {
    if(node.type==='textDirective' && node.name==='tags') return node;
    else return null;
}

export function getTags(node: TextDirective) : string[] {
    if(node.children) {
        let text_child = node.children[0];
        if(text_child.type==='text') {
            return text_child.value.match(allowed_page_names_with_anchor_regex) || [];
        }
    }
    return []
}