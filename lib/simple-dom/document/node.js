function Node(nodeType, nodeName, nodeValue) {
  this.nodeType = nodeType;
  this.nodeName = nodeName;
  this.nodeValue = nodeValue;

  this.childNodes = new ChildNodes(this);

  this.parentNode = null;
  this.previousSibling = null;
  this.nextSibling = null;
  this.firstChild = null;
  this.lastChild = null;
}

Node.prototype.appendChild = function(node) {
  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    /*jshint boss:true*/
    for (var frag = node; node = frag.firstChild;) {
      this.appendChild(node);
    }

    return;
  }

  if (node.parentNode) { node.parentNode.removeChild(node); }

  node.parentNode = this;
  var refNode = this.lastChild;
  if (refNode === null) {
    this.firstChild = node;
    this.lastChild = node;
  } else {
    node.previousSibling = refNode;
    refNode.nextSibling = node;
    this.lastChild = node;
  }
};

Node.prototype.insertBefore = function(node, refNode) {
  if (refNode == null) {
    return this.appendChild(node);
  }

  node.parentNode = this;

  var previousSibling = refNode.previousSibling;
  if (previousSibling) {
    previousSibling.nextSibling = node;
    node.previousSibling = previousSibling;
  }

  refNode.previousSibling = node;
  node.nextSibling = refNode;

  if (this.firstChild === refNode) {
    this.firstChild = node;
  }
};

Node.prototype.removeChild = function(refNode) {
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
};

Node.ELEMENT_NODE = 1;
Node.ATTRIBUTE_NODE = 2;
Node.TEXT_NODE = 3;
Node.CDATA_SECTION_NODE = 4;
Node.ENTITY_REFERENCE_NODE = 5;
Node.ENTITY_NODE = 6;
Node.PROCESSING_INSTRUCTION_NODE = 7;
Node.COMMENT_NODE = 8;
Node.DOCUMENT_NODE = 9;
Node.DOCUMENT_TYPE_NODE = 10;
Node.DOCUMENT_FRAGMENT_NODE = 11;
Node.NOTATION_NODE = 12;

function ChildNodes(node) {
  this.node = node;
}

ChildNodes.prototype.item = function(index) {
  var child = this.node.firstChild;

  for (var i = 0; child && index !== i; i++) {
    child = child.nextSibling;
  }

  return child;
};

export default Node;
