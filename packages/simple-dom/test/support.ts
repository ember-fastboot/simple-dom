/* global window */
import { Document } from '@simple-dom/document';
import DocumentFragment from '@simple-dom/document/src/document-fragment';
import Element from '@simple-dom/document/src/element';

declare const window: any;

export const document = (() => {
  if (typeof window !== 'undefined' && window.document) {
    return window.document;
  }
  return new Document();
})();

export interface Attrs {
  [attr: string]: any | null | undefined;
}

export function element(tagName: string, attrs?: Attrs, ...children: any[]): Element;
export function element(tagName: string, attrs?: Attrs) {
  const el = document.createElement(tagName);
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

export function fragment(...children: any[]): DocumentFragment;
export function fragment() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < arguments.length; i++) {
    frag.appendChild(arguments[i]);
  }
  return frag;
}

export function text(s: string) {
  return document.createTextNode(s);
}

export function comment(s: string) {
  return document.createComment(s);
}

export function html(s: string) {
  return document.createRawHTMLSection(s);
}
