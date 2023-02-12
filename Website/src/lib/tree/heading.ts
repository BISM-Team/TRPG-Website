import { defaultMatcher, type Matcher } from 'mdast-util-inject'
import type { Root } from 'mdast'
import { toString } from 'mdast-util-to-string'
import { visit }  from 'unist-util-visit'
import type { Heading } from 'mdast'
import type { LeafDirective } from 'mdast-util-directive'
import crypto from 'crypto'

export interface AdvancedHeading extends Heading {
    attributes?: Record<string, string | null | undefined> | null | undefined
}

function stripHash(str: string) : {result: string, depth: 1|2|3|4|5|6} {
    let n = 1 as 1|2|3|4|5|6;
    let first=true;
    while(str.length && str[0]==='#') {
        str=str.slice(1);
        if(!first && n<6) n+=1;
        if(first) first=false;
    }
    return {result: str.trimStart(), depth: n};
}

function addHash(str:string, depth: 1|2|3|4|5|6) : string {
    return ('#'.repeat(depth)+' '+str);
}

export function directiveToHeading() {
    return function(tree: Root) {
        visit(tree, 'leafDirective', node => {
            if(node.name === 'heading' && node.children && node.children[0]) {
                let child=node.children[0];
                if(child.type === 'text') {
                    delete (node as any).name;
                    let advHeading = (node as unknown) as AdvancedHeading;
                    advHeading.type='heading';
                    let res = stripHash(child.value);
                    child.value = res.result;
                    advHeading.depth = res.depth;
                }
            }
        })
    }
}

export function headingToDirective() {
    return function(tree: Root) {
        visit(tree, 'heading', node => {
            if(node.children && node.children[0]) {
                let child=node.children[0];
                if(child.type === 'text') {
                    let directive = (node as unknown) as LeafDirective;
                    directive.type='leafDirective';
                    directive.name='heading';
                    directive.attributes = directive.attributes || {}
                    child.value = addHash(child.value, node.depth);
                    delete (node as any).depth;
                }
            }
        })
    }
}

export function addHeadingIds(options?: { randomizer?: () => string} | void) {
    return function(tree: Root) {
      visit(tree, 'heading', node => {
        let advHeading = node as AdvancedHeading;
        advHeading.attributes = advHeading.attributes || {};
        if(!advHeading.attributes.id) advHeading.attributes.id = ((options ? options.randomizer : undefined) || (() => {return crypto.randomBytes(4).toString('hex')}))();
      });
    }
  }

export function searchHeadingIndex(tree: Root, searchText: string, matcher: Matcher = defaultMatcher) {
    for(let index=0; index<tree.children.length; index++) {
        let child = tree.children[index];
        if(child.type === 'heading' && matcher(toString(child).trim().toLowerCase(), searchText.trim().toLowerCase())) {
            return index;
        }
    }
    return -1;
}

export function getHeadingModifiers(tree: Root, index: number) {
    let _node = tree.children[index];
    if(_node.type==='heading') {
        let node = _node as AdvancedHeading;
        if(node.attributes && node.attributes.modifiers) {
            return node.attributes.modifiers.split(';').map((modifier: string) => { return modifier.trim().toLowerCase(); });
        }
    }
    return [];
}

export function getHeadingViewers(tree: Root, index: number) {
    let _node = tree.children[index];
    if(_node.type==='heading') {
        let node = _node as AdvancedHeading;
        if(node.attributes && node.attributes.viewers) {
            return node.attributes.viewers.split(';').map((viewer: string) => { return viewer.trim().toLowerCase(); });
        }
    }
    return [];
}