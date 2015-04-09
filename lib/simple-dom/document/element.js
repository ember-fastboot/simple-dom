import Node from './node';

function Element(tagName, ownerDocument) {
  tagName = tagName.toUpperCase();

  this.nodeConstructor(1, tagName, null, ownerDocument);
  this.attributes = [];
  this.tagName = tagName;
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeConstructor = Node;

Element.prototype._cloneNode = function() {
  var node = this.ownerDocument.createElement(this.tagName);

  node.attributes = this.attributes.map(function(attr) {
    return { name: attr.name, value: attr.value, specified: attr.specified };
  });

  return node;
};

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
  return null;
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

Element.prototype.getElementsByTagName = function(name){
	name = name.toUpperCase();
	var elements = [];
	var cur = this.firstChild;
	while(cur) {
		if(cur.nodeType === Node.ELEMENT_NODE) {
			if(cur.nodeName === name || name === "*") {
				elements.push(cur);
			}
			elements.push.apply(elements, cur.getElementsByTagName(name));
		}
		cur = cur.nextSibling;
	}
	return elements;
};

Element.prototype.contains = function(child){
	child = child.parentNode;
	while(child) {
		if(child === this) {
			return true;
		}
		child = child.parentNode;
	}
	return false;
};


export default Element;
