import { SimpleDocumentFragment, SimpleNode, SimpleNodeType } from '@simple-dom/interface';
import { SimpleElementImpl } from './node';

export function insertBefore(parentNode: SimpleNode, newChild: SimpleNode, refChild: SimpleNode | null): void {
  if (refChild == null) {
    appendChild(parentNode, newChild);
    return;
  }

  invalidate(parentNode as SimpleElementImpl);

  if (newChild.nodeType === SimpleNodeType.DOCUMENT_FRAGMENT_NODE) {
    insertFragment(newChild, parentNode, refChild.previousSibling, refChild);
    return;
  }

  if (newChild.parentNode) {
    removeChild(newChild.parentNode, newChild);
  }

  newChild.parentNode = parentNode;

  const previousSibling = refChild.previousSibling;
  if (previousSibling) {
    previousSibling.nextSibling = newChild;
    newChild.previousSibling = previousSibling;
  } else {
    newChild.previousSibling = null;
  }

  refChild.previousSibling = newChild;
  newChild.nextSibling = refChild;

  if (parentNode.firstChild === refChild) {
    parentNode.firstChild = newChild;
  }
}

export function appendChild(parentNode: SimpleNode, newChild: SimpleNode): void {
  invalidate(parentNode as SimpleElementImpl);

  if (newChild.nodeType === SimpleNodeType.DOCUMENT_FRAGMENT_NODE) {
    insertFragment(newChild, parentNode, parentNode.lastChild, null);
    return;
  }

  if (newChild.parentNode !== null) {
    removeChild(newChild.parentNode, newChild);
  }

  newChild.parentNode = parentNode;
  const refNode = parentNode.lastChild;
  if (refNode === null) {
    parentNode.firstChild = newChild;
    parentNode.lastChild = newChild;
  } else {
    newChild.previousSibling = refNode;
    refNode.nextSibling = newChild;
    parentNode.lastChild = newChild;
  }
}

function invalidate(parentNode: SimpleElementImpl) {
  const childNodes = parentNode._childNodes;
  if (childNodes !== undefined) {
    childNodes.stale = true;
  }
}

export function removeChild(parentNode: SimpleNode, oldChild: SimpleNode): void {
  invalidate(parentNode as SimpleElementImpl);
  if (parentNode.firstChild === oldChild) {
    parentNode.firstChild = oldChild.nextSibling;
  }
  if (parentNode.lastChild === oldChild) {
    parentNode.lastChild = oldChild.previousSibling;
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
}

function insertFragment(
  fragment: SimpleDocumentFragment,
  newParent: SimpleNode,
  before: SimpleNode | null,
  after: SimpleNode | null,
): void {
  if (fragment.firstChild === null) {
    return;
  }

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
