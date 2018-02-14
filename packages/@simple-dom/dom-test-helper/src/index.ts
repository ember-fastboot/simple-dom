import createDocument from '@simple-dom/document';
import {
  SimpleComment,
  SimpleDocument,
  SimpleDocumentFragment,
  SimpleElement,
  SimpleNode,
  SimpleText,
} from '@simple-dom/interface';

declare const self: any;

export interface Attrs {
  [attr: string]: any | null | undefined;
}

export const SIMPLE_DOCUMENT_TYPE = 'simple document';
export const BROWSER_DOCUMENT_TYPE = 'browser document';

export type DOCUMENT_TYPE = typeof SIMPLE_DOCUMENT_TYPE | typeof BROWSER_DOCUMENT_TYPE;

export type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

export interface ModuleWithDocumentHelper {
  type: DOCUMENT_TYPE;
  document: SimpleDocument;
  element(tagName: string, attrs?: Attrs, ...children: SimpleNode[]): SimpleElement;
  text(s: string): SimpleText;
  comment(s: string): SimpleComment;
  fragment(...children: SimpleNode[]): SimpleDocumentFragment;
  insertAdjacentHTML(element: SimpleElement, position: InsertPosition, text: string): SimpleElement;
}

export type ModuleWithDocument = (name: string, callback: ModuleWithDocumentCallback) => void;
export type ModuleWithDocumentCallback = (config: ModuleWithDocumentHelper, hooks: NestedHooks) => void;

/* istanbul ignore next */
export const moduleWithDocument = (() => {
  abstract class Helper {
    public abstract type: DOCUMENT_TYPE;

    // this is initialized in beforeEach hook
    public document!: SimpleDocument;

    constructor() {
      // allow helpers to be destructured
      this.insertAdjacentHTML = this.insertAdjacentHTML.bind(this);
      this.text = this.text.bind(this);
      this.comment = this.comment.bind(this);
      this.fragment = this.fragment.bind(this);
      this.element = this.element.bind(this);
    }

    public abstract setup(hooks: NestedHooks): void;

    public abstract insertAdjacentHTML(element: SimpleElement, position: InsertPosition, text: string): SimpleElement;

    public text(s: string): SimpleText {
      return this.document.createTextNode(s);
    }

    public comment(s: string): SimpleComment {
      return this.document.createComment(s);
    }

    public fragment(...children: any[]): SimpleDocumentFragment;
    public fragment(): SimpleDocumentFragment {
      const frag = this.document.createDocumentFragment();
      for (let i = 0; i < arguments.length; i++) {
        frag.appendChild(arguments[i]);
      }
      return frag;
    }

    public element(tagName: string, attrs?: Attrs, ...children: any[]): SimpleElement;
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

  class SimpleHelper extends Helper {
    public type: typeof SIMPLE_DOCUMENT_TYPE = SIMPLE_DOCUMENT_TYPE;

    public setup(hooks: NestedHooks) {
      hooks.beforeEach(() => {
        this.document = createDocument();
      });

      hooks.afterEach(() => {
        this.document = undefined as any;
      });
    }

    public insertAdjacentHTML(element: SimpleElement, position: InsertPosition, text: string): SimpleElement {
      const raw = this.document.createRawHTMLSection!(text);
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

  class RealHelper extends Helper {
    public type: typeof BROWSER_DOCUMENT_TYPE = BROWSER_DOCUMENT_TYPE;

    public setup(hooks: NestedHooks) {
      hooks.beforeEach(() => {
        this.document = self.document.implementation.createHTMLDocument();
      });

      hooks.afterEach(() => {
        this.document = undefined as any;
      });
    }

    public insertAdjacentHTML(element: SimpleElement, position: InsertPosition, text: string): SimpleElement {
      (element as any).insertAdjacentHTML(position, text);
      return element;
    }
  }

  const helpers: Helper[] = [
    new SimpleHelper(),
  ];

  if (typeof self !== 'undefined' && self.document) {
    helpers.push(new RealHelper());
  }

  // tslint:disable-next-line:no-shadowed-variable
  return function moduleWithDocument(name: string, callback: ModuleWithDocumentCallback) {
    if (helpers.length === 1) {
      QUnit.module(name, (hooks: NestedHooks) => {
        helpers[0].setup(hooks);
        callback(helpers[0], hooks);
      });
    } else {
      QUnit.module(name, () => {
        helpers.forEach((helper) => {
          QUnit.module(helper.type, (hooks: NestedHooks) => {
            helper.setup(hooks);
            callback(helper, hooks);
          });
        });
      });
    }
  };
})();
