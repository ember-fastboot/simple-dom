export const enum NodeType {
  RAW = -1,
  ELEMENT_NODE = 1,
  ATTRIBUTE_NODE = 2,
  TEXT_NODE = 3,
  CDATA_SECTION_NODE = 4,
  ENTITY_REFERENCE_NODE = 5,
  ENTITY_NODE = 6,
  PROCESSING_INSTRUCTION_NODE = 7,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  DOCUMENT_FRAGMENT_NODE = 11,
  NOTATION_NODE = 12,
}

export default class Node {
  public static ELEMENT_NODE = NodeType.ELEMENT_NODE;
  public static ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE;
  public static TEXT_NODE = NodeType.TEXT_NODE;
  public static CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE;
  public static ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE;
  public static ENTITY_NODE = NodeType.ENTITY_NODE;
  public static PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE;
  public static COMMENT_NODE = NodeType.COMMENT_NODE;
  public static DOCUMENT_NODE = NodeType.DOCUMENT_NODE;
  public static DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE;
  public static DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE;
  public static NOTATION_NODE = NodeType.NOTATION_NODE;

  public parentNode: Node | null = null;
  public previousSibling: Node | null = null;
  public nextSibling: Node | null = null;
  public firstChild: Node | null = null;
  public lastChild: Node | null = null;

  public childNodes: {
    item(index: number): Node | null;
  };

  constructor(public nodeType: NodeType, public nodeName: string, public nodeValue: string | null) {
    this.childNodes = new ChildNodes(this);
  }

  public cloneNode(deep: true) {
    const node = this._cloneNode();

    if (deep) {
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

  public appendChild(node: Node) {
    if (node.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
      insertFragment(node, this, this.lastChild, null);
      return node;
    }

    if (node.parentNode) { node.parentNode.removeChild(node); }

    node.parentNode = this;
    const refNode = this.lastChild;
    if (refNode === null) {
      this.firstChild = node;
      this.lastChild = node;
    } else {
      node.previousSibling = refNode;
      refNode.nextSibling = node;
      this.lastChild = node;
    }

    return node;
  }

  public insertBefore(node: Node, refNode: Node | null) {
    if (refNode == null) {
      return this.appendChild(node);
    }

    if (node.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
      insertFragment(node, this, refNode ? refNode.previousSibling : null, refNode);
      return;
    }

    if (node.parentNode) { node.parentNode.removeChild(node); }

    node.parentNode = this;

    const previousSibling = refNode.previousSibling;
    if (previousSibling) {
      previousSibling.nextSibling = node;
      node.previousSibling = previousSibling;
    } else {
      node.previousSibling = null;
    }

    refNode.previousSibling = node;
    node.nextSibling = refNode;

    if (this.firstChild === refNode) {
      this.firstChild = node;
    }
  }

  public removeChild(refNode: Node) {
    if (this.firstChild === refNode) {
      this.firstChild = refNode.nextSibling;
    }
    if (this.lastChild === refNode) {
      this.lastChild = refNode.previousSibling;
    }
    if (refNode.previousSibling) {
      refNode.previousSibling.nextSibling = refNode.nextSibling;
    }
    if (refNode.nextSibling) {
      refNode.nextSibling.previousSibling = refNode.previousSibling;
    }
    refNode.parentNode = null;
    refNode.nextSibling = null;
    refNode.previousSibling = null;
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
