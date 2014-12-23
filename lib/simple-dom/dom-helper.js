function DOMHelper(document, parser) {
  this.document = document;
  this.parser = parser;
}

// Currently just the set of helpers for morph, not all of HTMLBars
DOMHelper.prototype.createTextNode = function(text) {
  this.document.createTextNode(text);
};

DOMHelper.prototype.createComment = function(text) {
  this.document.createComment(text);
};

DOMHelper.prototype.parseHTML = function(html, context) {
  this.parser.parseHTML(html, context);
};

export default DOMHelper;