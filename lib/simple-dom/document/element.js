import Node from './node';

function Element(tagName) {
  tagName = tagName.toUpperCase();

  this.nodeConstructor(1, tagName, null);
  this.attributes = [];
  this.tagName = tagName;
  this.childNodes = new ChildNodes(this);
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeConstructor = Node;

Element.prototype.getAttribute = function(_name) {
  var attributes = this.attributes;
  var name = _name.toLowerCase();
  var attr;
  for (var i=0, l=attributes.length; i<l; i++) {
    attr = attributes[i];
    if (attr.name === name) {
      return attr.value;
    }
  }
  return '';
};

Element.prototype.setAttribute = function(_name, value) {
  var attributes = this.attributes;
  var name = _name.toLowerCase();
  var attr;
  for (var i=0, l=attributes.length; i<l; i++) {
    attr = attributes[i];
    if (attr.name === name) {
      attr.value = value;
      return;
    }
  }
  attributes.push({
    name: name,
    value: value,
    specified: true // serializer compat with old IE
  });
};

Element.prototype.removeAttribute = function(name) {
  var attributes = this.attributes;
  for (var i=0, l=attributes.length; i<l; i++) {
    var attr = attributes[i];
    if (attr.name === name) {
      attributes.splice(i, 1);
      return;
    }
  }
};

function ChildNodes(element) {
  this.element = element;
}

ChildNodes.prototype.item = function(index) {
  var child = this.element.firstChild;

  for (var i = 0; child && index !== i; i++) {
    child = child.nextSibling;
  }

  return child;
};

export default Element;
