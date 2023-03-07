import util from 'util'
import crypto from 'crypto'

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function includes<type>(arr: Array<type>, value: type, matcherFn?: (first: type, second: type) => boolean) : boolean {
  if(arr.find(matcherFn ? item => { return matcherFn(item, value); } : item => { return item===value; }))
    { return true; }
  else { return false; }
}

export function logWholeObject(obj: any) {
  console.log(util.inspect(obj, {showHidden: false, depth: null, colors: true}))
}

export function randomHex(byte_length: number=4) {
  return crypto.randomBytes(byte_length).toString('hex');
}

export function arraymove<type>(arr: Array<type>, fromIndex: number, toIndex: number) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}