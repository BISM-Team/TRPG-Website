import type { Root } from 'mdast';
import {visit} from 'unist-util-visit'

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function myRemarkPlugin() {
  return (tree: Root, file) => {
    visit(tree, (node) => {
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