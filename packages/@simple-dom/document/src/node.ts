import {
  AttrNamespace,
  ElementNamespace,
  Namespace,
  SimpleAttr,
  SimpleChildNodes,
  SimpleComment,
  SimpleDocument,
  SimpleDocumentFragment,
  SimpleDocumentType,
  SimpleElement,
  SimpleNode,
  SimpleNodeType,
  SimpleRawHTMLSection,
  SimpleText,
} from '@simple-dom/interface';
import {
  adjustAttrName,
  EMPTY_ATTRS,
  getAttribute,
  removeAttribute,
  setAttribute,
} from './attributes';
import { ChildNodes } from './child-nodes';
import { cloneNode } from './clone';
import {
  appendChild,
  insertBefore,
  removeChild,
} from './mutation';
import {
  parseQualifiedName,
} from './qualified-name';

export type SimpleElementImpl = SimpleNodeImpl<SimpleNodeType.ELEMENT_NODE, SimpleDocument, null, ElementNamespace>;
export type SimpleDocumentImpl = SimpleNodeImpl<SimpleNodeType.DOCUMENT_NODE, null, null, Namespace.HTML>;

export default class SimpleNodeImpl<
  T extends SimpleNodeType,
  O extends SimpleDocument | null,
  V extends string | null,
  N extends ElementNamespace | undefined
> {
  public parentNode: SimpleNode | null = null;
  public previousSibling: SimpleNode | null = null;
  public nextSibling: SimpleNode | null = null;
  public firstChild: SimpleNode | null = null;
  public lastChild: SimpleNode | null = null;

  public attributes: SimpleAttr[] = EMPTY_ATTRS;

  /**
   * @internal
   */
  public _childNodes: ChildNodes | undefined = undefined;

  constructor(
    public readonly ownerDocument: O,
    public readonly nodeType: T,
    public readonly nodeName: string,
    public nodeValue: V,
    public readonly namespaceURI: N) {
  }

  public get tagName(): string {
    return this.nodeName;
  }

  public get childNodes(): SimpleChildNodes {
    let children = this._childNodes;
    if (children === undefined) {
      children = this._childNodes = new ChildNodes(this as SimpleNode);
    }
    return children;
  }

  public cloneNode(this: SimpleNode, deep?: boolean): SimpleNode {
    return cloneNode(this, deep === true);
  }

  public appendChild<Node extends SimpleNode>(this: SimpleNode, newChild: Node): Node {
    appendChild(this, newChild);
    return newChild;
  }

  public insertBefore<Node extends SimpleNode>(this: SimpleNode, newChild: Node, refChild: SimpleNode | null): Node {
    insertBefore(this, newChild, refChild);
    return newChild;
  }

  public removeChild<Node extends SimpleNode>(this: SimpleNode, oldChild: Node): Node {
    removeChild(this, oldChild);
    return oldChild;
  }

  public getAttribute(this: SimpleElementImpl, name: string): string | null {
    const localName = adjustAttrName(this.namespaceURI, name);
    return getAttribute(this.attributes, null, localName);
  }

  public getAttributeNS(this: SimpleElementImpl, namespaceURI: AttrNamespace | null, localName: string): string | null {
    return getAttribute(this.attributes, namespaceURI, localName);
  }

  public setAttribute(this: SimpleElementImpl, name: string, value: string): void {
    const localName = adjustAttrName(this.namespaceURI, name);
    setAttribute(this, null, null, localName, value);
  }

  public setAttributeNS(
    this: SimpleElementImpl,
    namespaceURI: AttrNamespace | null,
    qualifiedName: string,
    value: string,
  ) {
    const [prefix, localName] = parseQualifiedName(qualifiedName);
    setAttribute(this as SimpleElementImpl, namespaceURI, prefix, localName, value);
  }

  public removeAttribute(this: SimpleElementImpl, name: string): void {
    const localName = adjustAttrName(this.namespaceURI, name);
    removeAttribute(this.attributes, null, localName);
  }

  public removeAttributeNS(this: SimpleElementImpl, namespaceURI: AttrNamespace | null, localName: string) {
    removeAttribute(this.attributes, namespaceURI, localName);
  }

  get doctype() {
    return this.firstChild as SimpleDocumentType;
  }

  get documentElement() {
    return this.lastChild as SimpleElement;
  }

  get head() {
    return this.documentElement.firstChild as SimpleElement;
  }

  get body() {
    return this.documentElement.lastChild as SimpleElement;
  }

  public createElement(this: SimpleDocumentImpl, name: string): SimpleElement {
    return new SimpleNodeImpl(this, SimpleNodeType.ELEMENT_NODE, name.toUpperCase(), null, Namespace.HTML);
  }

  public createElementNS(this: SimpleDocumentImpl, namespace: ElementNamespace, qualifiedName: string): SimpleElement {
    // we don't care to parse the qualified name because we only support HTML documents
    // which don't support prefixed elements
    return new SimpleNodeImpl(this, SimpleNodeType.ELEMENT_NODE, qualifiedName, null, namespace);
  }

  public createTextNode(this: SimpleDocumentImpl, text: string): SimpleText {
    return new SimpleNodeImpl(this, SimpleNodeType.TEXT_NODE, '#text', text, void 0);
  }

  public createComment(this: SimpleDocumentImpl, text: string): SimpleComment {
    return new SimpleNodeImpl(this, SimpleNodeType.COMMENT_NODE, '#comment', text, void 0);
  }

  public createRawHTMLSection(this: SimpleDocumentImpl, text: string): SimpleRawHTMLSection {
    return new SimpleNodeImpl(this, SimpleNodeType.RAW, '#raw', text, void 0);
  }

  public createDocumentFragment(this: SimpleDocumentImpl): SimpleDocumentFragment {
    return new SimpleNodeImpl(this, SimpleNodeType.DOCUMENT_FRAGMENT_NODE, '#document-fragment', null, void 0);
  }
}
