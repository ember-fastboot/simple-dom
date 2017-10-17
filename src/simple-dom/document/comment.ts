import Node, { NodeType } from './node';

export default class Comment extends Node {
  constructor(text: string) {
    super(NodeType.COMMENT_NODE, '#comment', text);
  }

  protected _cloneNode() {
    return new Comment(this.nodeValue as string);
  }
}
