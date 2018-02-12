import { SimpleNodeType, SimpleRawHTMLSection } from '@simple-dom/interface';
import Node from './node';

export default class RawHTMLSection extends Node implements SimpleRawHTMLSection {
  public nodeType: SimpleNodeType.RAW = SimpleNodeType.RAW;

  constructor(text: string) {
    super('#raw-html-section', text);
  }

  protected _cloneNode() {
    return new RawHTMLSection(this.nodeValue!);
  }
}
