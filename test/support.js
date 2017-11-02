const Document = require('@simple-dom/document').Document;

const document = (function (){
  if (typeof window !== 'undefined' && window.document) {
    return window.document;
  }
  return new Document();
}());

function element(tagName, attrs) {
  var el = document.createElement(tagName);
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  for (var i=2; i<arguments.length; i++) {
    el.appendChild(arguments[i]);
  }
  return el;
}

function fragment() {
  var frag = document.createDocumentFragment();
  for (var i=0; i<arguments.length; i++) {
    frag.appendChild(arguments[i]);
  }
  return frag;
}

function text(s) {
  return document.createTextNode(s);
}

function comment(s) {
  return document.createComment(s);
}

function html(s) {
  return document.createRawHTMLSection(s);
}

exports.document = document;
exports.element = element;
exports.fragment = fragment;
exports.text = text;
exports.html = html;
