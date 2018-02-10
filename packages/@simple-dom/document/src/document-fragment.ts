import { SimpleDocumentFragment, SimpleNodeType } from '@simple-dom/interface';
import Node from './node';

export default class DocumentFragment extends Node implements SimpleDocumentFragment {
  public nodeType: SimpleNodeType.DOCUMENT_FRAGMENT_NODE = SimpleNodeType.DOCUMENT_FRAGMENT_NODE;

  constructor() {
    super('#document-fragment', null);
  }

  protected _cloneNode() {
    return new DocumentFragment();
  }
}
