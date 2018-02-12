import { SimpleAttr, SimpleElement, SimpleNodeType } from '@simple-dom/interface';
import Node from './node';

export default class Element extends Node implements SimpleElement {
  public nodeType: SimpleNodeType.ELEMENT_NODE = SimpleNodeType.ELEMENT_NODE;
  public attributes: SimpleAttr[] = [];

  constructor(tagName: string) {
    super(tagName.toUpperCase(), null);
  }

  public get tagName(): string {
    return this.nodeName;
  }

  public getAttribute(name: string): string | null {
    const attributes = this.attributes;
    const n = name.toLowerCase();
    let attr;
    for (let i = 0, l = attributes.length; i < l; i++) {
      attr = attributes[i];
      if (attr.name === n) {
        return attr.value;
      }
    }
    return null;
  }

  public setAttribute(name: string, value: any | undefined | null): void {
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

  public removeAttribute(name: string): void {
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

    const attrs = node.attributes = [] as SimpleAttr[];

    const src = this.attributes;

    for (let i = 0; i < src.length; i++) {
      const attr = src[i];
      attrs.push({ name: attr.name, specified: attr.specified, value: attr.value });
    }

    return node;
  }
}
