function Node(nodeType, nodeName, nodeValue) {
  this.nodeType = nodeType;
  this.nodeName = nodeName;
  this.nodeValue = nodeValue;

  this.parentNode = null;
  this.previousSibling = null;
  this.nextSibling = null;
  this.firstChild = null;
  this.lastChild = null;
}

Node.prototype.appendChild = function(node) {
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
};

export default Node;