import { Effect, Primitive } from "./Classes";

export function compile(str: string) : Primitive[] {
    return [];
}

export function is_property_defined(item: any, property: string) : boolean {
    return get_property(item, property) !== undefined;
}

export function get_property(item: any, property: string) : any {
    return item[property];
}

export function set_property(item: any, property: string, value: any) : any {
    return item[property] = value;
}

export function list_properties(item: any, starting_with: string) {
    Object.keys(item).filter(str => { return str.includes(starting_with); });
}

export function set_active_state(effect: Effect, b: boolean) {
    effect.active=b;
}

export function set_blocked_state(effect: Effect, b: boolean) {
    effect.blocked=b;
    if(!b) effect.active=false;
}

export function subscribeToEvent() {}

export function raiseEvent() {}

export function openUiComponent() {}