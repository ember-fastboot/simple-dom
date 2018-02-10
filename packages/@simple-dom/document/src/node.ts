import {
  SimpleChildNodes, SimpleNode, SimpleNodeType } from '@simple-dom/interface';

export default abstract class Node implements SimpleNode {
  public abstract readonly nodeType: SimpleNodeType;

  public parentNode: SimpleNode | null = null;
  public previousSibling: SimpleNode | null = null;
  public nextSibling: SimpleNode | null = null;
  public firstChild: SimpleNode | null = null;
  public lastChild: SimpleNode | null = null;

  private _childNodes: ChildNodes | undefined = undefined;

  constructor(public readonly nodeName: string, public nodeValue: string | null) {
  }

  public get childNodes(): SimpleChildNodes {
    let children = this._childNodes;
    if (children === undefined) {
      children = this._childNodes = new ChildNodes(this);
    }
    return children as SimpleChildNodes;
  }

  public cloneNode(deep?: boolean): SimpleNode {
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

  public appendChild<T extends SimpleNode>(newChild: T): T {
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

  public insertBefore<T extends SimpleNode>(newChild: T, refChild: SimpleNode | null): T {
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

  public removeChild<T extends SimpleNode>(oldChild: T): T {
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

  protected abstract _cloneNode(): SimpleNode;
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
