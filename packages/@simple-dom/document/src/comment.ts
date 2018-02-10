import { SimpleComment, SimpleNodeType } from '@simple-dom/interface';
import Node from './node';

export default class Comment extends Node implements SimpleComment {
  public nodeType: SimpleNodeType.COMMENT_NODE = SimpleNodeType.COMMENT_NODE;

  constructor(text: string) {
    super('#comment', text);
  }

  protected _cloneNode() {
    return new Comment(this.nodeValue!);
  }
}
