import {
  Namespace,
  SimpleAttr,
  SimpleAttrs,
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

const EMPTY_ATTRS: SimpleAttr[] = [];

type SimpleElementImpl = SimpleNodeImpl<SimpleNodeType.ELEMENT_NODE, SimpleDocument, null, Namespace>;

export default class SimpleNodeImpl<
  T extends SimpleNodeType,
  O extends SimpleDocument | null,
  V extends string | null,
  N extends Namespace | undefined
> {
  public parentNode: SimpleNode | null = null;
  public previousSibling: SimpleNode | null = null;
  public nextSibling: SimpleNode | null = null;
  public firstChild: SimpleNode | null = null;
  public lastChild: SimpleNode | null = null;

  public attributes: SimpleAttr[] = EMPTY_ATTRS;

  private _childNodes: ChildNodes | undefined = undefined;

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

  public cloneNode(deep?: boolean): SimpleNode {
    const node = cloneNode(this) as SimpleNode;

    if (deep === true) {
      let child = this.firstChild;
      let nextChild = child;

      while (child !== null) {
        nextChild = child.nextSibling;
        node.appendChild(child.cloneNode(true));
        child = nextChild;
      }
    }

    return node;
  }

  // tslint:disable-next-line:max-line-length
  public appendChild<Node extends SimpleNode>(this: SimpleNode, newChild: Node): Node {
    if (newChild.nodeType === SimpleNodeType.DOCUMENT_FRAGMENT_NODE) {
      insertFragment(newChild, this, this.lastChild, null);
      return newChild;
    }

    if (newChild.parentNode) { newChild.parentNode.removeChild(newChild); }

    newChild.parentNode = this;
    const refNode = this.lastChild;
    if (refNode === null) {
      this.firstChild = newChild;
      this.lastChild = newChild;
    } else {
      newChild.previousSibling = refNode;
      refNode.nextSibling = newChild;
      this.lastChild = newChild;
    }

    return newChild;
  }

  public insertBefore<Node extends SimpleNode>(this: SimpleNode, newChild: Node, refChild: SimpleNode | null): Node {
    if (refChild == null) {
      return this.appendChild(newChild);
    }

    if (newChild.nodeType === SimpleNodeType.DOCUMENT_FRAGMENT_NODE) {
      insertFragment(newChild, this, refChild.previousSibling, refChild);
      return newChild;
    }

    if (newChild.parentNode) { newChild.parentNode.removeChild(newChild); }

    newChild.parentNode = this;

    const previousSibling = refChild.previousSibling;
    if (previousSibling) {
      previousSibling.nextSibling = newChild;
      newChild.previousSibling = previousSibling;
    } else {
      newChild.previousSibling = null;
    }

    refChild.previousSibling = newChild;
    newChild.nextSibling = refChild;

    if (this.firstChild === refChild) {
      this.firstChild = newChild;
    }

    return newChild;
  }

  public removeChild<Node extends SimpleNode>(oldChild: Node): Node {
    if (this.firstChild === oldChild) {
      this.firstChild = oldChild.nextSibling;
    }
    if (this.lastChild === oldChild) {
      this.lastChild = oldChild.previousSibling;
    }
    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = oldChild.nextSibling;
    }
    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = oldChild.previousSibling;
    }
    oldChild.parentNode = null;
    oldChild.nextSibling = null;
    oldChild.previousSibling = null;
    return oldChild;
  }

  public getAttribute(name: string): string | null {
    const attributes = this.attributes;
    if (attributes === EMPTY_ATTRS) {
      return null;
    }
    const localName = this.namespaceURI === Namespace.HTML ? name.toLowerCase() : name;
    const index = indexOfAttribute(attributes, null, localName);
    if (index === -1) {
      return null;
    }
    return this.attributes[index].value;
  }

  public getAttributeNS(namespaceURI: Namespace | null, localName: string): string | null {
    const { attributes } = this;
    const index = indexOfAttribute(attributes, namespaceURI, localName);
    if (index === -1) {
      return null;
    }
    return this.attributes[index].value;
  }

  public setAttribute(this: SimpleElement, name: string, value: string): void {
    setAttribute(
      this as SimpleElementImpl,
      null,
      null,
      adjustLocalName(this.namespaceURI, name),
      value);
  }

  public setAttributeNS(namespaceURI: Namespace | null, qualifiedName: string, value: string) {
    let localName = qualifiedName;
    let prefix: string | null = null;
    const i = qualifiedName.indexOf(':');
    if (i !== -1) {
      prefix = qualifiedName.slice(0, i);
      localName = qualifiedName.slice(i + 1);
    }
    setAttribute(this as SimpleElementImpl, namespaceURI, prefix, localName, value);
  }

  public removeAttribute(name: string): void {
    const { attributes } = this;
    const localName = this.namespaceURI === Namespace.HTML ? name.toLowerCase() : name;

    const index = indexOfAttribute(attributes, null, localName);
    if (index === -1) {
      return;
    }

    attributes.splice(index, 1);
  }

  public removeAttributeNS(namespaceURI: Namespace | null, localName: string) {
    const { attributes } = this;

    const index = indexOfAttribute(attributes, namespaceURI, localName);
    if (index === -1) { return; }

    attributes.splice(index, 1);
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

  public createElement(this: SimpleDocument, name: string): SimpleElement {
    return new SimpleNodeImpl(this, SimpleNodeType.ELEMENT_NODE, name.toUpperCase(), null, Namespace.HTML);
  }

  public createElementNS(this: SimpleDocument, namespace: Namespace, qualifiedName: string): SimpleElement {
    // we don't care to parse the qualified name because we only support HTML documents
    // which don't support prefixed elements
    return new SimpleNodeImpl(this, SimpleNodeType.ELEMENT_NODE, qualifiedName, null, namespace);
  }

  public createTextNode(this: SimpleDocument, text: string): SimpleText {
    return new SimpleNodeImpl(this, SimpleNodeType.TEXT_NODE, '#text', text, void 0);
  }

  public createComment(this: SimpleDocument, text: string): SimpleComment {
    return new SimpleNodeImpl(this, SimpleNodeType.COMMENT_NODE, '#comment', text, void 0);
  }

  public createRawHTMLSection(this: SimpleDocument, text: string): SimpleRawHTMLSection {
    return new SimpleNodeImpl(this, SimpleNodeType.RAW, '#raw', text, void 0);
  }

  public createDocumentFragment(this: SimpleDocument): SimpleDocumentFragment {
    return new SimpleNodeImpl(this, SimpleNodeType.DOCUMENT_FRAGMENT_NODE, '#document-fragment', null, void 0);
  }
}

function insertFragment(
  fragment: SimpleNode, newParent: SimpleNode, before: SimpleNode | null, after: SimpleNode | null) {
  if (!fragment.firstChild) { return; }

  const firstChild = fragment.firstChild;
  fragment.firstChild = fragment.lastChild = null;
  let lastChild = firstChild;
  let node: SimpleNode | null = firstChild;

  firstChild.previousSibling = before;
  if (before) {
    before.nextSibling = firstChild;
  } else {
    newParent.firstChild = firstChild;
  }

  while (node) {
    node.parentNode = newParent;
    lastChild = node;
    node = node.nextSibling;
  }

  lastChild.nextSibling = after;
  if (after) {
    after.previousSibling = lastChild;
  } else {
    newParent.lastChild = lastChild;
  }
}

function cloneNode<
  T extends SimpleNodeType,
  O extends SimpleDocument | null,
  V extends string | null,
  N extends Namespace | undefined
>(
  node: SimpleNodeImpl<T, O, V, N>,
) {
  const clone = new SimpleNodeImpl(
    node.ownerDocument,
    node.nodeType,
    node.nodeName,
    node.nodeValue,
    node.namespaceURI,
  );
  clone.attributes = copyAttrs(node.attributes);
  return clone;
}

function copyAttrs(attrs: SimpleAttr[]) {
  if (attrs === EMPTY_ATTRS) {
    return attrs;
  }
  const copy: SimpleAttr[] = [];
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    copy.push({
      localName: attr.localName,
      name: attr.name,
      namespaceURI: attr.namespaceURI,
      prefix: attr.prefix,
      specified: true,
      value: attr.value,
    });
  }
  return copy;
}

class ChildNodes {
  constructor(private node: SimpleNode) {
  }

  public item(index: number) {
    let child = this.node.firstChild;

    for (let i = 0; child && index !== i; i++) {
      child = child.nextSibling;
    }

    return child;
  }
}

function indexOfAttribute(attributes: SimpleAttrs, namespaceURI: Namespace | null, localName: string): number {
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.namespaceURI === namespaceURI && attr.localName === localName) {
      return i;
    }
  }
  return -1;
}

function adjustLocalName(namespaceURI: Namespace, localName: string) {
  return namespaceURI === Namespace.HTML ? localName.toLowerCase() : localName;
}

// https://dom.spec.whatwg.org/#dom-element-setattributens
function setAttribute(
  element: SimpleNodeImpl<SimpleNodeType.ELEMENT_NODE, SimpleDocument, null, Namespace>,
  namespaceURI: Namespace | null,
  prefix: string | null,
  localName: string,
  value: string,
) {
  if (typeof value !== 'string') {
    value = '' + value;
  }
  let { attributes } = element;
  if (attributes === EMPTY_ATTRS) {
    attributes = element.attributes = [];
  } else {
    const index = indexOfAttribute(attributes, namespaceURI, localName);
    if (index !== -1) {
      attributes[index].value = value;
      return;
    }
  }
  attributes.push({
    localName,
    name: prefix === null ? localName : prefix + ':' + localName,
    namespaceURI,
    prefix,
    specified: true, // serializer compat with old IE
    value,
  });
}
