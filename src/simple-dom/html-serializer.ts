const ESC = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;'
};

function matcher(char: keyof typeof ESC) {
  if (ESC[char] === undefined) {
    return char;
  }
  return ESC[char];
}

export default class HTMLSerializer {
  constructor(private voidMap: {
    [tagName: string]: boolean
  }) {
  }

  openTag(element: Node) {
    return '<' + element.nodeName.toLowerCase() + this.attributes(element.attributes) + '>';
  }

  closeTag(element: Node) {
    return '</' + element.nodeName.toLowerCase() + '>';
  }

  isVoid(element: Node) {
    return this.voidMap[element.nodeName] === true;
  }

  attributes(namedNodeMap: NamedNodeMap) {
    var buffer = '';
    for (var i=0, l=namedNodeMap.length; i<l; i++) {
      buffer += this.attr(namedNodeMap[i]);
    }
    return buffer;
  }

  escapeAttrValue(attrValue: string) {
    if (attrValue.indexOf('&') > -1 || attrValue.indexOf('"') > -1) {
      return attrValue.replace(/[&"]/g, matcher);
    }

    return attrValue;
  }

  attr(attr: Attr) {
    if (!attr.specified) {
      return '';
    }
    if (attr.value) {
      return ' ' + attr.name + '="' + this.escapeAttrValue(attr.value) + '"';
    }
    return ' ' + attr.name;
  }

  escapeText(textNodeValue: string) {
    if (textNodeValue.indexOf('>') > -1 ||
        textNodeValue.indexOf('<') > -1 ||
        textNodeValue.indexOf('&') > -1
    ) {
      return textNodeValue.replace(/[&<>]/g, matcher);
    }

    return textNodeValue;
  }

  text(text: Node) {
    return this.escapeText(text.nodeValue!);
  }

  rawHTMLSection(text: Node): string {
    return text.nodeValue!;
  }

  comment(comment: Node) {
    return '<!--'+comment.nodeValue+'-->';
  }

  serializeChildren(node: Node) {
    var buffer = '';
    var next = node.firstChild;
    if (next) {
      buffer += this.serialize(next);

      while(next = next.nextSibling) {
        buffer += this.serialize(next);
      }
    }
    return buffer;
  }

  serialize(node: Node) {
    var buffer = '';

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
