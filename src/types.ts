import { EventHandler } from '@create-figma-plugin/utilities'

export interface RunAppHandler extends EventHandler {
  name: 'RUN_APP'
  handler: () => void
}

export interface FirstNodeHandler extends EventHandler {
  name: 'FIRST_NODE'
  handler: (node: any) => void
}

export interface SelectTextNodeHandler extends EventHandler {
  name: 'SELECT_TEXT_NODE'
  handler: (node: TextNode) => void
}
