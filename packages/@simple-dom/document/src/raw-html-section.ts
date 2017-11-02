import Node, { NodeType } from './node';

export default class RawHTMLSection extends Node {
  constructor(text: string) {
    super(NodeType.RAW, '#raw-html-section', text);
  }

  protected _cloneNode() {
    return new RawHTMLSection(this.nodeValue!);
  }
}
