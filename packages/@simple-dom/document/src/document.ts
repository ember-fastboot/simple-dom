import {
  SimpleComment,
  SimpleDocument,
  SimpleDocumentFragment,
  SimpleElement,
  SimpleNodeType,
  SimpleRawHTMLSection,
  SimpleText,
} from '@simple-dom/interface';
import Comment from './comment';
import DocumentFragment from './document-fragment';
import Element from './element';
import Node from './node';
import RawHTMLSection from './raw-html-section';
import Text from './text';

export default class Document extends Node implements SimpleDocument {
  public nodeType: SimpleNodeType.DOCUMENT_NODE = SimpleNodeType.DOCUMENT_NODE;
  public documentElement: Element;
  public head: Element;
  public body: Element;

  constructor() {
    super('#document', null);
    this.documentElement = new Element('html');
    this.head = new Element('head');
    this.body = new Element('body');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }

  public createElement(tagName: string): SimpleElement {
    return new Element(tagName);
  }

  public createTextNode(text: string): SimpleText {
    return new Text(text);
  }

  public createComment(text: string): SimpleComment {
    return new Comment(text);
  }

  public createRawHTMLSection(text: string): SimpleRawHTMLSection {
    return new RawHTMLSection(text);
  }

  public createDocumentFragment(): SimpleDocumentFragment {
    return new DocumentFragment();
  }

  protected _cloneNode(): SimpleDocument {
    return new Document();
  }
}
