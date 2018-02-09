import Comment from './comment';
import DocumentFragment from './document-fragment';
import Element from './element';
import Node, { NodeType } from './node';
import RawHTMLSection from './raw-html-section';
import Text from './text';

export default class Document extends Node {
  public documentElement: Element;
  public head: Element;
  public body: Element;

  constructor() {
    super(NodeType.DOCUMENT_NODE, '#document', null);
    this.documentElement = new Element('html');
    this.head = new Element('head');
    this.body = new Element('body');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }

  public createElement(tagName: string) {
    return new Element(tagName);
  }

  public createTextNode(text: string) {
    return new Text(text);
  }

  public createComment(text: string) {
    return new Comment(text);
  }

  public createRawHTMLSection(text: string) {
    return new RawHTMLSection(text);
  }

  public createDocumentFragment() {
    return new DocumentFragment();
  }

  protected _cloneNode() {
    return new Document();
  }
}
