import { SimpleNodeType, SimpleText } from '@simple-dom/interface';
import Node from './node';

export default class Text extends Node implements SimpleText {
  public nodeType: SimpleNodeType.TEXT_NODE = SimpleNodeType.TEXT_NODE;

  constructor(text: string) {
    super('#text', text);
  }

  protected _cloneNode(): SimpleText {
    return new Text(this.nodeValue!);
  }
}
