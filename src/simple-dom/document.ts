import Node from './document/node';
import Element from './document/element';
import Text from './document/text';
import Comment from './document/comment';
import RawHTMLSection from './document/raw-html-section';
import DocumentFragment from './document/document-fragment';

export default class Document extends Node {
  documentElement: Element;
  head: Element;
  body: Element;

  constructor() {
    super(9, '#document', null);
    this.documentElement = new Element('html');
    this.head = new Element('head');
    this.body = new Element('body');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }

  createElement(tagName: string) {
    return new Element(tagName);
  }

  createTextNode(text: string) {
    return new Text(text);
  }

  createComment(text: string) {
    return new Comment(text);
  }

  createRawHTMLSection(text: string) {
    return new RawHTMLSection(text);
  }

  createDocumentFragment() {
    return new DocumentFragment();
  }
}
