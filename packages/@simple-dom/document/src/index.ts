import {
  SimpleDocument,
  SimpleNodeType,
} from '@simple-dom/interface';
import SimpleNodeImpl from './node';

export default function createDocument(): SimpleDocument {
  const document = new SimpleNodeImpl(null, SimpleNodeType.DOCUMENT_NODE, '#document', null);
  const doctype = new SimpleNodeImpl(document, SimpleNodeType.DOCUMENT_TYPE_NODE, 'html', null);
  const html = new SimpleNodeImpl(document, SimpleNodeType.ELEMENT_NODE, 'HTML', null);
  const head = new SimpleNodeImpl(document, SimpleNodeType.ELEMENT_NODE, 'HEAD', null);
  const body = new SimpleNodeImpl(document, SimpleNodeType.ELEMENT_NODE, 'BODY', null);
  html.appendChild(head);
  html.appendChild(body);
  document.appendChild(doctype);
  document.appendChild(html);
  return document;
}
