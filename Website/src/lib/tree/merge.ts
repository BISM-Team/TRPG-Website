import type { Root } from 'mdast'
import { getHeadingModifiability } from './modifications';
import { searchHeadingIndexById, type AdvancedHeading } from './heading';

export function mergeTrees(left: Root, right: Root, username: string) : Root {
    const tree: Root = {type: 'root', children: []};
    const first_left = left.children[0];
    const first_right = right.children[0];
    if(!(first_left.type==='heading') || !(first_right.type==='heading')) throw new Error('root heading not present');
    if(getHeadingModifiability(first_left, username)) {
        rightRecursion(left, right, tree, insertUntilNextHeading(right, tree, 0), username);
    } else {
        leftRecursion(left, right, tree, insertUntilNextHeading(left, tree, 0), username);
    }
    return tree;
}

function leftRecursion(left: Root, right: Root, tree: Root, index: number, username: string) {
    if(index===-1) return;
    const heading = left.children[index] as AdvancedHeading;
    if(getHeadingModifiability(heading, username)) {
        if(!heading.attributes || !heading.attributes.id) throw new Error('invalid heading');
        const _index = searchHeadingIndexById(right, heading.attributes.id);
        if(_index>=0) {
            rightRecursion(left, right, tree, insertUntilNextHeading(right, tree, _index), username);
        } else {
            leftRecursion(left, right, tree, skipUntilNextHeading(left, index), username);
        }
    } else {
        leftRecursion(left, right, tree, insertUntilNextHeading(left, tree, index), username);
    }
}

function rightRecursion(left: Root, right: Root, tree: Root, index: number, username: string) {
    if(index===-1) return;
    const heading = right.children[index] as AdvancedHeading;
    if(getHeadingModifiability(heading, username)) {
        rightRecursion(left, right, tree, insertUntilNextHeading(right, tree, index), username);
    } else {
        if(!heading.attributes || !heading.attributes.id) throw new Error('invalid heading');
        const _index = searchHeadingIndexById(left, heading.attributes.id);
        if(_index>=0) {
            leftRecursion(left, right, tree, insertUntilNextHeading(left, tree, _index), username);
        } else {
            rightRecursion(left, right, tree, skipUntilNextHeading(right, index), username);
        }
    }
}

function insertUntilNextHeading(src: Root, dest: Root, index: number) : number {
    let first=true;
    while(first || src.children[index].type!=='heading') {
        dest.children.push(src.children[index]);
        first=false;
        index++;
        if(index===src.children.length) return -1;
    }
    return index;
}

function skipUntilNextHeading(src: Root, index: number) : number {
    let first=true;
    while(first || src.children[index].type!=='heading') {
        first=false;
        index++;
        if(index===src.children.length) return -1;
    }
    return index;
}