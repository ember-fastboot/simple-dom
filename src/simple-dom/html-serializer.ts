const ESC = {
  '"': '&quot;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

function matcher(char: keyof typeof ESC) {
  if (ESC[char] === undefined) {
    return char;
  }
  return ESC[char];
}

export default class HTMLSerializer {
  constructor(private voidMap: {
    [tagName: string]: boolean,
  }) {
  }

  public openTag(element: Node) {
    return '<' + element.nodeName.toLowerCase() + this.attributes(element.attributes) + '>';
  }

  public closeTag(element: Node) {
    return '</' + element.nodeName.toLowerCase() + '>';
  }

  public isVoid(element: Node) {
    return this.voidMap[element.nodeName] === true;
  }

  public attributes(namedNodeMap: NamedNodeMap) {
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

  public attr(attr: Attr) {
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

  public text(text: Node) {
    return this.escapeText(text.nodeValue!);
  }

  public rawHTMLSection(text: Node): string {
    return text.nodeValue!;
  }

  public comment(comment: Node) {
    return '<!--' + comment.nodeValue + '-->';
  }

  public serializeChildren(node: Node) {
    let buffer = '';
    let next = node.firstChild;
    while (next !== null) {
      buffer += this.serialize(next);
      next = next.nextSibling;
    }
    return buffer;
  }

  public serialize(node: Node) {
    let buffer = '';

    // open
    switch (node.nodeType) {
      case 1:
        buffer += this.openTag(node);
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

    if (node.nodeType === 1 && !this.isVoid(node)) {
      buffer += this.closeTag(node);
    }

    return buffer;
  }
}
