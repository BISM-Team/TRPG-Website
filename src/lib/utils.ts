import util from "util";
import crypto from "crypto";
import { error, redirect } from "@sveltejs/kit";
import type {
  CardData,
  Dashboard,
  NumericVariable,
  StringVariable,
} from "@prisma/client";

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function includes<type>(
  arr: Array<type>,
  value: type,
  matcherFn?: (first: type, second: type) => boolean
): boolean {
  if (
    arr.find(
      matcherFn
        ? (item) => {
            return matcherFn(item, value);
          }
        : (item) => {
            return item === value;
          }
    )
  ) {
    return true;
  } else {
    return false;
  }
}

export function logWholeObject<type>(obj: type) {
  console.log(
    util.inspect(obj, { showHidden: false, depth: null, colors: true })
  );
}

export function randomHex(byte_length = 4) {
  return crypto.randomBytes(byte_length).toString("hex");
}

export function arraymove<type>(
  arr: Array<type>,
  fromIndex: number,
  toIndex: number
) {
  arr.splice(toIndex, 0, ...arr.splice(fromIndex, 1));
}

export async function propagateErrors(response: Response, url: URL) {
  if (!response.ok) {
    if (response.status === 401)
      throw redirect(307, "/login?redirect=" + url.toString());
    else {
      throw error(response.status, await response.json());
    }
  }
}

export function replaceCardSource(
  card: CardData,
  dashboard: Dashboard & {
    numericVariables: NumericVariable[];
    stringVariables: StringVariable[];
  }
) {
  const new_card: CardData & { mod_properties: any } = {
    ...card,
    mod_properties: {},
  };
  let mod_src = JSON.stringify(new_card.properties);
  dashboard.numericVariables.forEach((variable) => {
    mod_src = mod_src.replaceAll(
      new RegExp(`{${variable.name}}`, "gi"),
      variable.value.toString()
    );
  });
  dashboard.stringVariables.forEach((variable) => {
    mod_src = mod_src.replaceAll(
      new RegExp(`{${variable.name}}`, "gi"),
      variable.value
    );
  });
  new_card.mod_properties = JSON.parse(mod_src);
  return new_card;
}
