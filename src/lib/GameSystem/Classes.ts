export class Effect {
  outgoing_refs: string[]; // outputs/parents
  incoming_refs: string[]; // inputs/children
  fn: CallableFunction;
  priority: number;
  constructor(
    fn: CallableFunction,
    modifies: string[],
    gets: string[],
    priority = 0
  ) {
    this.invoke = this.invoke.bind(this);
    this.outgoing_refs = modifies;
    this.incoming_refs = gets;
    this.priority = priority;
    this.fn = fn;
  }

  invoke(scope: Record<string, any>) {
    this.fn(scope);
  }
}

export class Event {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export class Ability {
  name: string;
  effects: Effect[];
  constructor(name: string, effects: Effect[] = []) {
    this.name = name;
    this.effects = effects;
  }
}

export class Item {
  name: string;
  effects: Effect[];
  constructor(name: string, effects: Effect[] = []) {
    this.name = name;
    this.effects = effects;
  }
}

export class Character {
  name: string;
  abilities: Ability[];
  items: Item[];
  constructor(name: string, abilities: Ability[] = [], items: Item[] = []) {
    this.name = name;
    this.abilities = abilities;
    this.items = items;
  }
}
