var ESC = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;'
};

function matcher(char) {
  if (ESC[char] === undefined) {
    return char;
  }

  return ESC[char];
}

function HTMLSerializer(voidMap) {
  this.voidMap = voidMap;
}

HTMLSerializer.prototype.openTag = function(element) {
  return '<' + element.nodeName.toLowerCase() + this.attributes(element.attributes) + '>';
};

HTMLSerializer.prototype.closeTag = function(element) {
  return '</' + element.nodeName.toLowerCase() + '>';
};

HTMLSerializer.prototype.isVoid = function(element) {
  return this.voidMap[element.nodeName] === true;
};

HTMLSerializer.prototype.attributes = function(namedNodeMap) {
  var buffer = '';
  for (var i=0, l=namedNodeMap.length; i<l; i++) {
    buffer += this.attr(namedNodeMap[i]);
  }
  return buffer;
};

HTMLSerializer.prototype.escapeAttrValue = function(attrValue) {
  if (attrValue.indexOf('&') > -1 || attrValue.indexOf('"') > -1) {
    return attrValue.replace(/[&"]/g, matcher);
  }

  return attrValue;
};

HTMLSerializer.prototype.attr = function(attr) {
  if (!attr.specified) {
    return '';
  }
  if (attr.value) {
    return ' ' + attr.name + '="' + this.escapeAttrValue(attr.value) + '"';
  }
  return ' ' + attr.name;
};

HTMLSerializer.prototype.escapeText = function(textNodeValue) {
  if (textNodeValue.indexOf('>') > -1 ||
      textNodeValue.indexOf('<') > -1 ||
      textNodeValue.indexOf('&') > -1
  ) {
    return textNodeValue.replace(/[&<>]/g, matcher);
  }

  return textNodeValue;
};

HTMLSerializer.prototype.text = function(text) {
  return this.escapeText(text.nodeValue);
};

HTMLSerializer.prototype.rawHTMLSection = function(text) {
  return text.nodeValue;
};

HTMLSerializer.prototype.comment = function(comment) {
  return '<!--'+comment.nodeValue+'-->';
};

HTMLSerializer.prototype.serializeChildren = function(node) {
  var buffer = '';
  var next = node.firstChild;
  if (next) {
    buffer += this.serialize(next);

    while(next = next.nextSibling) {
      buffer += this.serialize(next);
    }
  }
  return buffer;
};

HTMLSerializer.prototype.serialize = function(node) {
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
};

export default HTMLSerializer;
