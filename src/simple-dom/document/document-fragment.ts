import Node, { NodeType } from './node';

export default class DocumentFragment extends Node {
  constructor() {
    super(NodeType.DOCUMENT_FRAGMENT_NODE, '#document-fragment', null);
  }

  protected _cloneNode() {
    return new DocumentFragment();
  }
}
