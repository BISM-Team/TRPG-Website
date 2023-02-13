import { Character, Primitive } from "./Classes";

export function buildTree(character: Character) : Tree {
    let primitives : Primitive[] = [];

    for (const ability of character.abilities) {
        primitives = primitives.concat(ability.effects.map(effect => { return effect.primitive; }));
    }

    for (const item of character.items) {
        primitives = primitives.concat(item.effects.map(effect => { return effect.primitive; }));
    }

    const nodes: Node[] = [];

    for (const prim of primitives) {
        const new_node = new Node('', prim);
        
        prim.incoming_refs.forEach(ref => {
            let node = nodes.find(node => { return node.name == ref; });
            if(node==undefined) {
                node=new Node(ref, new Primitive(()=>{}));
                nodes.push(node);
            }
            new_node.addChild(node);
        });

        prim.outgoing_refs.forEach(ref => {
            let node = nodes.find(node => { return node.name == ref; });
            if(node==undefined) {
                node=new Node(ref, new Primitive(()=>{}));
                nodes.push(node);
            }
            node.addChild(new_node);
        });

        nodes.push(new_node);
    }

    return new Tree(character.name, nodes);
}

class Tree {
    name: string;
    nodes: Node[];
    scope: any;
    constructor(name: string, nodes: Node[] = []) {
        this.invoke = this.invoke.bind(this);
        this.name=name;
        this.nodes=nodes;
        for (const node of this.nodes) {
            node.sortChilds();
        }
    }

    invoke() {
        this.scope={};
        for (const node of this.nodes) {
            node.invoke(this.scope);
        }
        for (const node of this.nodes) {
            node.children.forEach(child => { child.explored=false; });
            node.evaluated=false;
        }
    }
}

class Node {
    name: string;
    primitive: Primitive;
    priority: number;
    children: { node: Node, explored: boolean }[];
    evaluated: boolean;
    constructor(name: string, primitive: Primitive, children: Node[] = []) {
        this.invoke = this.invoke.bind(this);
        this.name=name;
        this.primitive=primitive;
        this.priority=primitive.priority;
        this.children=children.map(node => { return {node: node, explored: false}; })
                              .sort((child1, child2) => { return child1.node.priority - child2.node.priority; });
        this.evaluated=false;
    }

    addChild(node: Node) {
        this.children.push({node: node, explored: false});
    }

    sortChilds() {
        this.children.sort((child1, child2) => { return child1.node.priority - child2.node.priority; });
    }

    invoke(scope: any) {
        if(this.evaluated) return;

        for (const child of this.children) {
            if(!child.explored) { 
                child.explored=true;
                child.node.invoke(scope); 
            }
        }
        if(!this.evaluated) {
            this.evaluated=true;
            this.primitive.invoke(scope);
        }
    }
}