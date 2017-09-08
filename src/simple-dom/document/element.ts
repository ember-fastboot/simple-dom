import Node, { NodeType } from './node';

export default class Element extends Node {
  public nodeType: NodeType.ELEMENT_NODE;
  public tagName: string;
  public attributes: IAttr[] = [];

  constructor(tagName: string) {
    super(NodeType.ELEMENT_NODE, tagName.toUpperCase(), null);
    this.tagName = this.nodeName;
  }

  public getAttribute(name: string) {
    const attributes = this.attributes;
    const n = name.toLowerCase();
    let attr;
    for (let i = 0, l = attributes.length; i < l; i++) {
      attr = attributes[i];
      if (attr.name === n) {
        return attr.value;
      }
    }
    return '';
  }

  public setAttribute(name: string, value: any) {
    const attributes = this.attributes;
    const n = name.toLowerCase();
    let v: string;
    if (typeof value === 'string') {
      v = value;
    } else {
      v = '' + value;
    }
    let attr;
    for (let i = 0, l = attributes.length; i < l; i++) {
      attr = attributes[i];
      if (attr.name === n) {
        attr.value = v;
        return;
      }
    }
    attributes.push({
      name: n,
      specified: true, // serializer compat with old IE
      value: v,
    });
  }

  public removeAttribute(name: string) {
    const n = name.toLowerCase();
    const attributes = this.attributes;
    for (let i = 0, l = attributes.length; i < l; i++) {
      const attr = attributes[i];
      if (attr.name === n) {
        attributes.splice(i, 1);
        return;
      }
    }
  }

  protected _cloneNode() {
    const node = new Element(this.tagName);

    const attrs = node.attributes = [] as IAttr[];

    for (const attr of this.attributes) {
      attrs.push({ name: attr.name, specified: attr.specified, value: attr.value });
    }

    return node;
  }
}

export interface IAttr {
  name: string;
  value: string;
  specified: boolean;
}
