export interface INode {
  nodeType: number;
  nodeName: string;
  nodeValue: string | null;

  parentNode: INode | null;
  previousSibling: INode | null;
  nextSibling: INode | null;
  firstChild: INode | null;
  lastChild: INode | null;
}

export interface INamedNodeMap {
  [index: number]: IAttr;
  length: number;
}

export interface IAttr {
  specified: boolean;
  name: string;
  value: string;
}

export interface IElement extends INode {
  attributes: INamedNodeMap;
}

const ESC: {
  [char: string]: string;
} = {
  '"': '&quot;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

function matcher(char: string) {
  return ESC[char];
}

export default class HTMLSerializer {
  constructor(private voidMap: {
    [tagName: string]: boolean,
  }) {
  }

  public openTag(element: IElement) {
    return '<' + element.nodeName.toLowerCase() + this.attributes(element.attributes) + '>';
  }

  public closeTag(element: IElement) {
    return '</' + element.nodeName.toLowerCase() + '>';
  }

  public isVoid(element: IElement) {
    return this.voidMap[element.nodeName] === true;
  }

  public attributes(namedNodeMap: INamedNodeMap) {
    let buffer = '';
    for (let i = 0, l = namedNodeMap.length; i < l; i++) {
      buffer += this.attr(namedNodeMap[i]);
    }
    return buffer;
  }

  public escapeAttrValue(attrValue: string) {
    if (attrValue.indexOf('&') > -1 || attrValue.indexOf('"') > -1) {
      return attrValue.replace(/[&"]/g, matcher);
    }

    return attrValue;
  }

  public attr(attr: IAttr) {
    if (!attr.specified) {
      return '';
    }
    if (attr.value) {
      return ' ' + attr.name + '="' + this.escapeAttrValue(attr.value) + '"';
    }
    return ' ' + attr.name;
  }

  public escapeText(textNodeValue: string) {
    if (textNodeValue.indexOf('>') > -1 ||
        textNodeValue.indexOf('<') > -1 ||
        textNodeValue.indexOf('&') > -1
    ) {
      return textNodeValue.replace(/[&<>]/g, matcher);
    }

    return textNodeValue;
  }

  public text(text: INode) {
    return this.escapeText(text.nodeValue!);
  }

  public rawHTMLSection(text: INode): string {
    return text.nodeValue!;
  }

  public comment(comment: INode) {
    return '<!--' + comment.nodeValue + '-->';
  }

  public serializeChildren(node: INode) {
    let buffer = '';
    let next = node.firstChild;
    while (next !== null) {
      buffer += this.serialize(next);
      next = next.nextSibling;
    }
    return buffer;
  }

  public serialize(node: INode) {
    let buffer = '';

    // open
    switch (node.nodeType) {
      case 1:
        buffer += this.openTag(node as IElement);
        break;
      case 3:
        buffer += this.text(node);
        break;
      case -1:
        buffer += this.rawHTMLSection(node);
        break;
      case 8:
        buffer += this.comment(node);
        break;
      default:
        break;
    }

    buffer += this.serializeChildren(node);

    if (node.nodeType === 1 && !this.isVoid(node as IElement)) {
      buffer += this.closeTag(node as IElement);
    }

    return buffer;
  }
}
