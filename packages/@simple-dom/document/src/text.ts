import Node, { NodeType } from './node';

export default class Text extends Node {
  constructor(text: string) {
    super(NodeType.TEXT_NODE, '#text', text);
  }

  protected _cloneNode(): Text {
    return new Text(this.nodeValue as string);
  }
}
