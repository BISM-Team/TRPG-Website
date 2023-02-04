import util from 'util'

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function includes<type>(arr: Array<type>, value: type) : boolean {
  if(arr.find(item => { return item===value; }))
    { return true; }
  else { return false; }
}

export function logWholeObject(obj: any) {
  console.log(util.inspect(obj, {showHidden: false, depth: null, colors: true}))
}