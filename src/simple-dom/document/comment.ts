import Node, { NodeType } from './node';

export default class Comment extends Node {
  nodeValue: string;

  constructor(text: string) {
    super(NodeType.COMMENT_NODE, '#comment', text);
  }

  protected _cloneNode() {
    return new Comment(this.nodeValue);
  }
}
