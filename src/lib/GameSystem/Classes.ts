export class Effect {
    primitive: Primitive;
    blocked: boolean;
    active: boolean;
    constructor(fn: CallableFunction, modifies: string[], gets: string[], priority = 0, active = true, blocked = false) {
        this.primitive=new Primitive(fn, modifies, gets, priority);
        this.blocked=blocked;
        this.active=active;
    }
}

export class Event {
    name: string;
    constructor(name: string) {
        this.name=name;
    }
}

export class Ability {
    name: string;
    effects: Effect[];
    constructor(name: string, effects: Effect[] = []) {
        this.name=name;
        this.effects=effects;
    }
}

export class Item {
    name: string;
    effects: Effect[];
    constructor(name: string, effects: Effect[] = []) {
        this.name=name;
        this.effects=effects;
    }
}

export class Character {
    name: string;
    abilities: Ability[];
    items: Item[];
    constructor(name: string, abilities: Ability[] = [], items: Item[] = []) {
        this.name=name;
        this.abilities=abilities;
        this.items=items;
    }
}


export class Primitive {
    outgoing_refs: string[]; // outputs/parents
    incoming_refs: string[]; // inputs/children
    priority: number;
    fn: CallableFunction;
    constructor(fn: CallableFunction, modifies: string[] = [], gets: string[] = [], priority = 0) {
        this.invoke = this.invoke.bind(this);
        this.outgoing_refs=modifies;
        this.incoming_refs=gets;
        this.priority=priority;
        this.fn=fn;
    }

    invoke(scope: any) { this.fn(scope); }
}