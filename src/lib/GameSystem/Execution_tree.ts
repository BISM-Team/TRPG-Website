import type { Ability, Character, Effect, Item } from "@prisma/client";

export function buildTree(
  character: Pick<Character, "name"> & {
    abilities: (Ability & {
      effects: Effect[];
    })[];
    items: (Item & {
      effects: Effect[];
    })[];
  }
): Tree {
  let effects: Effect[] = [];

  for (const ability of character.abilities) {
    effects = effects.concat(ability.effects);
  }

  for (const item of character.items) {
    effects = effects.concat(item.effects);
  }

  const nodes: Node[] = [];

  for (const effect of effects) {
    const new_node = new Node("", effect);

    new_node.effect.reads.split(" ").forEach((ref) => {
      let node = nodes.find((node) => {
        return node.name == ref;
      });
      if (node == undefined) {
        node = new Node(ref, {
          fn: "",
          modifies: "",
          reads: "",
          priority: 0,
        });
        nodes.push(node);
      }
      new_node.addChild(node);
    });

    new_node.effect.modifies.split(" ").forEach((ref) => {
      let node = nodes.find((node) => {
        return node.name == ref;
      });
      if (node == undefined) {
        node = new Node(ref, {
          fn: "",
          modifies: "",
          reads: "",
          priority: 0,
        });
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
  scope: Record<string, any>;
  constructor(name: string, nodes: Node[] = []) {
    this.invoke = this.invoke.bind(this);
    this.name = name;
    this.nodes = nodes;
    this.scope = {};
    for (const node of this.nodes) {
      node.sortChilds();
    }
  }

  invoke() {
    this.scope = {};
    for (const node of this.nodes) {
      node.invoke(this.scope);
    }
    for (const node of this.nodes) {
      node.children.forEach((child) => {
        child.explored = false;
      });
      node.evaluated = false;
    }
  }
}

class Node {
  name: string;
  effect: Omit<Effect, "id" | "itemId" | "abilityId">;
  priority: number;
  children: { node: Node; explored: boolean }[];
  evaluated: boolean;
  constructor(
    name: string,
    effect: Omit<Effect, "id" | "itemId" | "abilityId">,
    children: Node[] = []
  ) {
    this.invoke = this.invoke.bind(this);
    this.name = name;
    this.effect = effect;
    this.priority = effect.priority;
    this.children = children
      .map((node) => {
        return { node: node, explored: false };
      })
      .sort((child1, child2) => {
        return child1.node.priority - child2.node.priority;
      });
    this.evaluated = false;
  }

  addChild(node: Node) {
    this.children.push({ node: node, explored: false });
  }

  sortChilds() {
    this.children.sort((child1, child2) => {
      return child1.node.priority - child2.node.priority;
    });
  }

  invoke(scope: Record<string, any>) {
    if (this.evaluated) return;

    for (const child of this.children) {
      if (!child.explored) {
        child.explored = true;
        child.node.invoke(scope);
      }
    }
    if (!this.evaluated) {
      this.evaluated = true;
      eval(this.effect.fn);
    }
  }
}
