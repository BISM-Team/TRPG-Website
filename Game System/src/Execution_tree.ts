import { Primitive } from "./Classes";

export class Tree {
    name: string;
    nodes: Node[];
    constructor(name: string, nodes: Node[] = []) {
        this.invoke = this.invoke.bind(this);
        this.name=name;
        this.nodes=nodes;
    }

    invoke() {
        for (const node of this.nodes) {
            node.invoke();
        }
        for (const node of this.nodes) {
            node.explored = node.explored.map(() => {return false;});
            node.evaluated=false;
        }
    }
};

export class Node {
    name: string;
    primitive: Primitive;
    parents: Node[];
    children: Node[];
    explored: boolean[];
    evaluated: boolean;
    constructor(name: string, primitive: Primitive, parents: Node[] = [], children: Node[] = []) {
        this.invoke = this.invoke.bind(this);
        this.name=name;
        this.primitive=primitive;
        this.parents=parents;
        this.children=children;
        this.explored = this.children.map(() => {return false;});
    }

    invoke() {
        if(this.evaluated) return;

        let i=0;
        for (const node of this.children) {
            if(!this.explored[i]) { 
                this.explored[i]=true;
                node.invoke(); 
            }
            i++;
        }
        if(!this.evaluated) {
            this.evaluated=true;
            this.primitive.invoke();
        }
    }
};