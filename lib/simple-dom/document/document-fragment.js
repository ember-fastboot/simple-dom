import Node from './node';

function DocumentFragment(ownerDocument) {
  this.nodeConstructor(11, '#document-fragment', null, ownerDocument);
}

DocumentFragment.prototype._cloneNode = function() {
  return new DocumentFragment();
};

DocumentFragment.prototype = Object.create(Node.prototype);
DocumentFragment.prototype.constructor = DocumentFragment;
DocumentFragment.prototype.nodeConstructor = Node;

export default DocumentFragment;
