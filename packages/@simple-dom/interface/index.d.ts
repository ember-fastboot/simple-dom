export const enum SimpleNodeType {
  RAW = -1,
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  DOCUMENT_FRAGMENT_NODE = 11,
}

export const enum Namespace {
  HTML = 'http://www.w3.org/1999/xhtml',
  SVG = 'http://www.w3.org/2000/svg',
}

export type SimpleNode =
  SimpleRawHTMLSection |
  SimpleElement |
  SimpleText |
  SimpleComment |
  SimpleDocument |
  SimpleDocumentType |
  SimpleDocumentFragment;

export interface SimpleNodeBase {
  // TODO
  // readonly namespaceURI: string;
  readonly ownerDocument: SimpleDocument | null;
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
  readonly namespaceURI: Namespace | null;
  readonly prefix: string | null;
  readonly localName: string;
  readonly name: string;
  readonly specified: true;
  value: string;
}

export interface SimpleAttrs {
  readonly length: number;
  [index: number]: SimpleAttr;
}

export interface SimpleElement extends SimpleNodeBase {
  readonly ownerDocument: SimpleDocument;
  readonly nodeType: SimpleNodeType.ELEMENT_NODE;
  readonly nodeValue: null;

  readonly namespaceURI: Namespace;
  readonly tagName: string;
  readonly attributes: SimpleAttrs;

  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
  // TODO: removeAttributeNS(namespaceURI: string | null, localName: string): void;
  setAttribute(name: string, value: any | undefined | null): void;
  // TODO: setAttributeNS(namespaceURI: string | null, qualifiedName: string, value: string): void;
}

export interface SimpleDocumentType extends SimpleNodeBase {
  readonly ownerDocument: SimpleDocument;
  readonly nodeType: SimpleNodeType.DOCUMENT_TYPE_NODE;
  readonly nodeValue: null;
}

export interface SimpleDocumentFragment extends SimpleNodeBase {
  readonly ownerDocument: SimpleDocument;
  readonly nodeType: SimpleNodeType.DOCUMENT_FRAGMENT_NODE;
  readonly nodeValue: null;
}

export interface SimpleDocument extends SimpleNodeBase {
  readonly ownerDocument: null;
  readonly nodeType: SimpleNodeType.DOCUMENT_NODE;
  readonly nodeValue: null;

  readonly doctype: SimpleDocumentType;
  readonly documentElement: SimpleElement;
  readonly head: SimpleElement;
  readonly body: SimpleElement;

  createElement(tag: string): SimpleElement;
  createElementNS(namespace: Namespace, name: string): SimpleElement;

  createTextNode(text: string): SimpleText;
  createComment(data: string): SimpleComment;

  createDocumentFragment(): SimpleDocumentFragment;

  // should we just add insertAdjacentHTML?
  // it isn't parsed so the DOM tree wouldn't reflect it
  // but would work the same for serializing
  createRawHTMLSection?(html: string): SimpleRawHTMLSection;
}

export interface SimpleRawHTMLSection extends SimpleNodeBase {
  readonly ownerDocument: SimpleDocument;
  readonly nodeType: SimpleNodeType.RAW;
  readonly nodeValue: string;
}

export interface SimpleText extends SimpleNodeBase {
  readonly ownerDocument: SimpleDocument;
  readonly nodeType: SimpleNodeType.TEXT_NODE;
  readonly nodeValue: string;
}

export interface SimpleComment extends SimpleNodeBase {
  readonly ownerDocument: SimpleDocument;
  readonly nodeType: SimpleNodeType.COMMENT_NODE;
  readonly nodeValue: string;
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
  readonly nodeType: number;
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
  readonly namespaceURI: Namespace;
  readonly attributes: SerializableAttrs;
}
