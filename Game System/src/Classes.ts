export class Score {
    name: string;
    value: any;
    constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }
};

export class Effect {
    name: string;
    primitives: Primitive[];
    blocked: boolean;
    active: boolean;
    constructor(name: string, primitives: Primitive[] = [], blocked: boolean = false, active: boolean = true) {
        this.name=name;
        this.primitives=primitives;
        this.blocked=blocked;
        this.active=active;
    }
};

export class Event {
    name: string;
    constructor(name: string) {
        this.name=name;
    }
};

export class Ability {
    name: string;
    scores: Score[];
    effects: Effect[];
    constructor(name: string, scores: Score[] = [], effects: Effect[] = []) {
        this.name=name;
        this.scores=scores;
        this.effects=effects;
    }
};

export class Item {
    name: string;
    scores: Score[];
    effects: Effect[];
    constructor(name: string, scores: Score[] = [], effects: Effect[] = []) {
        this.name=name;
        this.scores=scores;
        this.effects=effects;
    }
};

export class Character {
    name: string;
    scores: Score[];
    abilities: Ability[];
    items: Item[];
    constructor(name: string, scores: Score[] = [], abilities: Ability[] = [], items: Item[] = []) {
        this.name=name;
        this.scores=scores;
        this.abilities=abilities;
        this.items=items;
    }
};


export class Primitive {
    name: string;
    constructor(name: string) {
        this.name=name;
    }

    invoke() {

    }
};