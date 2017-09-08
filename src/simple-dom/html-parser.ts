import Document from './document';
import DocumentFragment from './document/document-fragment';
import Element from './document/element';
import Node from './document/node';

class HTMLParser {
  private parentStack: Node[];

  constructor(private tokenize: Tokenizer, private document: Document, private voidMap: VoidMap) {
    this.tokenize = tokenize;
    this.document = document;
    this.voidMap = voidMap;
    this.parentStack = [];
  }

  isVoid(element: Element) {
    return this.voidMap[element.nodeName] === true;
  }

  pushElement(token: StartTag) {
    var el = this.document.createElement(token.tagName);

    for (var i=0;i<token.attributes.length;i++) {
      var attr = token.attributes[i];
      el.setAttribute(attr[0], attr[1]);
    }

    if (this.isVoid(el)) {
      return this.appendChild(el);
    }

    this.parentStack.push(el);
  }

  popElement(token: EndTag) {
    var el = this.parentStack.pop()!;

    if (el.nodeName !== token.tagName.toUpperCase()) {
      throw new Error('unbalanced tag');
    }

    this.appendChild(el);
  }

  appendText(token: Chars) {
    var text = this.document.createTextNode(token.chars);
    this.appendChild(text);
  }

  appendComment(token: Comment) {
    var comment = this.document.createComment(token.chars);
    this.appendChild(comment);
  }

  appendChild(node: Node) {
    var parentNode = this.parentStack[this.parentStack.length-1];
    parentNode.appendChild(node);
  }

  parse(html: string) {
    var fragment = this.document.createDocumentFragment();
    this.parentStack.push(fragment);

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

    return this.parentStack.pop();
  }
}

export default HTMLParser;

export interface VoidMap {
  [tagName: string]: boolean | undefined;
}

export type Tokenizer = (s: string) => Token[];

export type Token = StartTag | EndTag | Chars | Comment;

export type Attr = [string, string];

export interface StartTag {
  type: 'StartTag';
  tagName: string;
  attributes: Attr[];
}

export interface EndTag {
  type: 'EndTag';
  tagName: string;
}

export interface Chars {
  type: 'Chars';
  chars: string;
}

export interface Comment {
  type: 'Comment';
  chars: string;
}
