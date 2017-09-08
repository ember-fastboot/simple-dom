import Node, { NodeType } from './node';

export default class Element extends Node {
  public nodeType: NodeType.ELEMENT_NODE;
  public tagName: string;
  public attributes: Attribute[] = [];

  constructor(tagName: string) {
    super(NodeType.ELEMENT_NODE, tagName.toUpperCase(), null);
    this.tagName = this.nodeName;
  }

  protected _cloneNode() {
    var node = new Element(this.tagName);

    node.attributes = this.attributes.map(function(attr) {
      return { name: attr.name, value: attr.value, specified: attr.specified };
    });

    return node;
  };

  public getAttribute(_name: string) {
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
  }

  public setAttribute(_name: string, _value: string) {
    var attributes = this.attributes;
    var name = _name.toLowerCase();
    var value;
    if (typeof _value === 'string') {
      value = _value;
    } else {
      value = '' + _value;
    }
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
  }

  public removeAttribute(_name: string) {
    let name = _name.toLowerCase();
    var attributes = this.attributes;
    for (var i=0, l=attributes.length; i<l; i++) {
      var attr = attributes[i];
      if (attr.name === name) {
        attributes.splice(i, 1);
        return;
      }
    }
  }
}

export interface Attribute {
  name: string;
  value: string;
  specified: boolean;
}
