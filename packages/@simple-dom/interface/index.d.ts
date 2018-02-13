export const enum SimpleNodeType {
  RAW = -1,
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  DOCUMENT_FRAGMENT_NODE = 11,
}

export interface SimpleNode {
  // TODO
  // readonly namespaceURI: string;

  readonly nodeType: SimpleNodeType;
  readonly nodeName: string;

  nodeValue: string | null;

  parentNode: SimpleNode | null;
  previousSibling: SimpleNode | null;
  nextSibling: SimpleNode | null;
  firstChild: SimpleNode | null;
  lastChild: SimpleNode | null;

  appendChild<T extends SimpleNode>(newChild: T): T;
  insertBefore<T extends SimpleNode>(newChild: T, refChild: SimpleNode | null): T;
  removeChild<T extends SimpleNode>(oldChild: T): T;

  cloneNode(deep?: boolean): SimpleNode;

  /**
   * This is pretty useless as implemented without length,
   * this was only used by htmlbars.
   */
  readonly childNodes: SimpleChildNodes;
}

export interface SimpleAttr {
  readonly name: string;
  readonly specified: true;
  value: string;
}

export interface SimpleAttrs {
  readonly length: number;
  [index: number]: SimpleAttr;
}

export interface SimpleElement extends SimpleNode {
  readonly nodeType: SimpleNodeType.ELEMENT_NODE;

  readonly tagName: string;
  readonly attributes: SimpleAttrs;

  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
  // TODO: removeAttributeNS(namespaceURI: string | null, localName: string): void;
  setAttribute(name: string, value: any | undefined | null): void;
  // TODO: setAttributeNS(namespaceURI: string | null, qualifiedName: string, value: string): void;
}

export interface SimpleDocumentFragment extends SimpleNode {
  nodeType: SimpleNodeType.DOCUMENT_FRAGMENT_NODE;
}

export interface SimpleDocument extends SimpleNode {
  nodeType: SimpleNodeType.DOCUMENT_NODE;

  head: SimpleElement;
  body: SimpleElement;

  createElement(tag: string): SimpleElement;

  // TODO createElementNS(namespace: Namespace, tag: string): Element;

  createTextNode(text: string): SimpleText;
  createComment(data: string): SimpleComment;

  createDocumentFragment(): SimpleDocumentFragment;

  // should we just add insertAdjacentHTML?
  // it isn't parsed so the DOM tree wouldn't reflect it
  // but would work the same for serializing
  createRawHTMLSection?(html: string): SimpleRawHTMLSection;
}

export interface SimpleRawHTMLSection extends SimpleNode {
  nodeType: SimpleNodeType.RAW;
}

export interface SimpleText extends SimpleNode {
  nodeType: SimpleNodeType.TEXT_NODE;
}

export interface SimpleComment extends SimpleNode {
  nodeType: SimpleNodeType.COMMENT_NODE;
}

/**
 * This is pretty useless as implemented without length,
 * this was only used by htmlbars.
 *
 * @deprecated
 */
export interface SimpleChildNodes {
  item(index: number): SimpleNode | null;
}

export interface SerializableNode {
  readonly nodeType: SimpleNodeType;
  readonly nodeName: string;
  readonly nodeValue: string | null;

  readonly nextSibling: SerializableNode | null;
  readonly firstChild: SerializableNode | null;
}

export interface SerializableAttrs {
  readonly length: number;
  readonly [index: number]: SerializableAttr;
}

export interface SerializableAttr {
  readonly specified: boolean;
  readonly name: string;
  readonly value: string;
}

export interface SerializableElement extends SerializableNode {
  readonly attributes: SerializableAttrs;
}
