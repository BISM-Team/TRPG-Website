import type { Root } from 'mdast';
import {visit} from 'unist-util-visit'

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function resolveCustomElements() {
  return (tree: Root) => {
    visit(tree, node => {
      if(node.type === 'leafDirective') {
        if(node.name === 'youtube') {
          const node_data_ref = node.data || (node.data = {})
          const node_attributes_ref = node.attributes || {}
          node_data_ref.hName = 'iframe'
          node_data_ref.hProperties = {
            src: 'https://www.youtube.com/embed/' + node_attributes_ref.id,
            width: 200,
            height: 200,
            frameBorder: 0,
            allow: 'picture-in-picture',
            allowFullScreen: true
          }
        }
      }
    })
  }
}


export function includes<type>(arr: Array<type>, value: type) : boolean {
  if(arr.find(item => { return item===value; }))
    { return true; }
  else { return false; }
}

export function filterOutNonVisible(self: string) {
  return (tree: Root) => {
    self = 'Player 1';
    visit(tree, first_level_node => {
      if(!first_level_node.children) { return; }
      for(let paragraph of first_level_node.children) {
        if(paragraph.type === 'paragraph' && paragraph.children) {
          for(let directive of paragraph.children) {
            if(directive.type === 'textDirective' && directive.name === 'visibility' && directive.children && directive.children[0].type === 'text') {
              let viewers: string[] =directive.children[0].value.split(';').map((viewer: string) => { return viewer.trim().toLowerCase(); });
              let dontRemove: boolean = includes(viewers, self.toLowerCase()) || includes(viewers, 'all');
              console.log(dontRemove);
            }
          }
        }
      }
    })

  }
}