import Node from './document/node';
import Element from './document/element';
import Text from './document/text';
import Comment from './document/comment';
import DocumentFragment from './document/document-fragment';

function Document() {
  this.nodeConstructor(this, 9, '#document', this);
  this.documentElement = new Element('html', this);
  this.body = new Element('body', this);
  this.documentElement.appendChild(this.body);
  this.appendChild(this.documentElement);
}

Document.prototype = Object.create(Node.prototype);
Document.prototype.constructor = Document;
Document.prototype.nodeConstructor = Node;

Document.prototype.createElement = function(tagName) {
  return new Element(tagName, this);
};

Document.prototype.createTextNode = function(text) {
  return new Text(text, this);
};

Document.prototype.createComment = function(text) {
  return new Comment(text, this);
};

Document.prototype.createDocumentFragment = function() {
  return new DocumentFragment(this);
};

export default Document;
