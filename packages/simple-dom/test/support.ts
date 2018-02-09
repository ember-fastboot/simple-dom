/* global window */
import { Comment, Document, Text } from '@simple-dom/document';
import DocumentFragment from '@simple-dom/document/src/document-fragment';
import Element from '@simple-dom/document/src/element';

declare const self: any;

export interface Attrs {
  [attr: string]: any | null | undefined;
}

export const SIMPLE_TYPE = 'simple';
export const REAL_TYPE = 'real';

export type DOM_TYPE = typeof SIMPLE_TYPE | typeof REAL_TYPE;

export type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

export class SimpleKind {
  public type: typeof SIMPLE_TYPE = SIMPLE_TYPE;

  public helper(): Helper {
    return new SimpleHelper();
  }
}

export class RealKind {
  public type: typeof REAL_TYPE = REAL_TYPE;

  public helper(): Helper {
    return new RealHelper();
  }
}

export abstract class Helper {
  constructor(public document: Document) {
    // allow helpers to be destructured
    this.insertAdjacentHTML = this.insertAdjacentHTML.bind(this);
    this.text = this.text.bind(this);
    this.comment = this.comment.bind(this);
    this.fragment = this.fragment.bind(this);
    this.element = this.element.bind(this);
  }

  public abstract insertAdjacentHTML(element: Element, position: InsertPosition, text: string): Element;

  public text(s: string): Text {
    return this.document.createTextNode(s);
  }

  public comment(s: string): Comment {
    return this.document.createComment(s);
  }

  public fragment(...children: any[]): DocumentFragment;
  public fragment() {
    const frag = this.document.createDocumentFragment();
    for (let i = 0; i < arguments.length; i++) {
      frag.appendChild(arguments[i]);
    }
    return frag;
  }

  public element(tagName: string, attrs?: Attrs, ...children: any[]): Element;
  public element(tagName: string, attrs?: Attrs) {
    const el = this.document.createElement(tagName);
    if (attrs !== undefined) {
      for (const key in attrs) {
        if (!attrs.hasOwnProperty(key)) {
          continue;
        }
        el.setAttribute(key, attrs[key]);
      }
    }
    for (let i = 2; i < arguments.length; i++) {
      el.appendChild(arguments[i]);
    }
    return el;
  }
}

export class SimpleHelper extends Helper {
  constructor() {
    super(new Document());
  }

  public insertAdjacentHTML(element: Element, position: InsertPosition, text: string): Element {
    const raw = this.document.createRawHTMLSection(text);
    switch (position) {
      case 'beforebegin':
        element.parentNode!.insertBefore(raw, element);
        break;
      case 'afterbegin':
        element.insertBefore(raw, element.firstChild);
        break;
      case 'beforeend':
        element.insertBefore(raw, null);
        break;
      case 'afterend':
        element.parentNode!.insertBefore(raw, element.nextSibling);
        break;
      default: throw Error('not implemented');
    }
    return element;
  }
}

export class RealHelper extends Helper {
  constructor() {
    super(self.document.implementation.createHTMLDocument());
  }

  public insertAdjacentHTML(element: Element, position: InsertPosition, text: string): Element {
    (element as any).insertAdjacentHTML(position, text);
    return element;
  }
}

export type DomKind = SimpleKind | RealKind;

export type ModuleCallback = (kind: DomKind) => void;

export function runBoth(defModule: ModuleCallback): void {
  if (typeof self !== 'undefined' && self.document) {
    QUnit.module(REAL_TYPE, () => {
      defModule(new RealKind());
    });
    QUnit.module(SIMPLE_TYPE, () => {
      defModule(new SimpleKind());
    });
  } else {
    defModule(new SimpleKind());
  }
}
