function HTMLParser(tokenize, document, voidMap) {
  this.tokenize = tokenize;
  this.document = document;
  this.voidMap = voidMap;
  this.stack = [];
  this.nodes = null;
  this.element = null;
  this.input = null;
}

HTMLParser.prototype.isVoid = function(element) {
  return this.voidMap[element.nodeName] === true;
};

HTMLParser.prototype.pushElement = function(token) {
  var el = this.document.createElement(token.tagName);
  for (var i=0;i<token.attributes.length;i++) {
    var attr = token.attributes[i];
    el.setAttribute(attr[0],attr[1]);
  }

  if (this.isVoid(el)) {
    this.appendChild(el);
    return;
  }

  if (this.element) {
    this.stack.push(this.element);
  }
  this.element = el;
};

HTMLParser.prototype.popElement = function(token) {
  var el = this.element;
  if (el.nodeName !== token.tagName.toUpperCase()) {
    throw new Error('unbalanced tag');
  }

  if (this.stack.length) {
    this.element = this.stack.pop();
  } else {
    this.element = null;
  }
  this.appendChild(el);
};

HTMLParser.prototype.appendText = function(token) {
  var text = this.document.createTextNode(token.chars);
  this.appendChild(text);
};

HTMLParser.prototype.appendComment = function(token) {
  var comment = this.document.createComment(token.chars);
  this.appendChild(comment);
};

HTMLParser.prototype.appendChild = function(node) {
  if (this.element) {
    this.element.appendChild(node);
  } else {
    this.nodes.push(node);
  }
};

HTMLParser.prototype.parse = function(html/*, context*/) {
  // TODO use context for namespaceURI issues
  this.nodes = [];
  var tokens = this.tokenize(html);
  for (var i=0, l=tokens.length; i<l; i++) {
    var token = tokens[i];
    switch (token.type) {
      case 'StartTag':
        this.pushElement(token);
        break;
      case 'EndTag':
        this.popElement(token);
        break;
      case 'Chars':
        this.appendText(token);
        break;
      case 'Comment':
        this.appendComment(token);
        break;
    }
  }
  return this.nodes;
};

export default HTMLParser;