export const enum NodeType {
  RAW = -1,
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_FRAGMENT_NODE = 11,
}

export interface NodeList {
  item(index: number): Node;
}

export default class Node {
  public static ELEMENT_NODE: number = NodeType.ELEMENT_NODE;
  public static TEXT_NODE: number = NodeType.TEXT_NODE;
  public static COMMENT_NODE: number = NodeType.COMMENT_NODE;
  public static DOCUMENT_NODE: number = NodeType.DOCUMENT_NODE;
  public static DOCUMENT_FRAGMENT_NODE: number = NodeType.DOCUMENT_FRAGMENT_NODE;

  public parentNode: Node | null = null;
  public previousSibling: Node | null = null;
  public nextSibling: Node | null = null;
  public firstChild: Node | null = null;
  public lastChild: Node | null = null;

  private _childNodes: ChildNodes | undefined = undefined;

  constructor(public readonly nodeType: number, public readonly nodeName: string, public nodeValue: string | null) {
  }

  public get childNodes() {
    let children = this._childNodes;
    if (children === undefined) {
      children = this._childNodes = new ChildNodes(this);
    }
    return children as NodeList;
  }

  public cloneNode(deep?: boolean) {
    const node = this._cloneNode();

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

  public appendChild<T extends Node>(newChild: T): T {
    if (newChild.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
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

  public insertBefore<T extends Node>(newChild: T, refChild: Node | null): T {
    if (refChild == null) {
      return this.appendChild(newChild);
    }

    if (newChild.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
      insertFragment(newChild, this, refChild ? refChild.previousSibling : null, refChild);
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

  public removeChild<T extends Node>(oldChild: T): T {
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

  protected _cloneNode() {
    return new Node(this.nodeType, this.nodeName, this.nodeValue);
  }
}

function insertFragment(fragment: Node, newParent: Node, before: Node | null, after: Node | null) {
  if (!fragment.firstChild) { return; }

  const firstChild = fragment.firstChild;
  let lastChild = firstChild;
  let node: Node | null = firstChild;

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

class ChildNodes {
  constructor(private node: Node) {
  }

  public item(index: number) {
    let child = this.node.firstChild;

    for (let i = 0; child && index !== i; i++) {
      child = child.nextSibling;
    }

    return child;
  }
}
