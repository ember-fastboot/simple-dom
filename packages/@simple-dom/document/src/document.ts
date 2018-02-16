import {
  Namespace,
  SimpleDocument,
  SimpleNodeType,
} from '@simple-dom/interface';
import SimpleNodeImpl from './node';

export function createHTMLDocument(): SimpleDocument {
  const document = new SimpleNodeImpl(null, SimpleNodeType.DOCUMENT_NODE, '#document', null, Namespace.HTML);
  const doctype = new SimpleNodeImpl(document, SimpleNodeType.DOCUMENT_TYPE_NODE, 'html', null, Namespace.HTML);
  const html = new SimpleNodeImpl(document, SimpleNodeType.ELEMENT_NODE, 'HTML', null, Namespace.HTML);
  const head = new SimpleNodeImpl(document, SimpleNodeType.ELEMENT_NODE, 'HEAD', null, Namespace.HTML);
  const body = new SimpleNodeImpl(document, SimpleNodeType.ELEMENT_NODE, 'BODY', null, Namespace.HTML);
  html.appendChild(head);
  html.appendChild(body);
  document.appendChild(doctype);
  document.appendChild(html);
  return document;
}
