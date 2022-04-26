import { SimpleDocument, SimpleElement, SimpleText, SimpleComment, SimpleDocumentFragment, SerializableNode, SerializableElement } from '@simple-dom/interface';

export class CheckSimple {
  createHTMLDocument(): SimpleDocument {
    return document.implementation.createHTMLDocument('foo') as SimpleDocument;
  }

  createElement(tagName: string): SimpleElement {
    return document.createElement(tagName) as SimpleElement;
  }

  createText(text: string): SimpleText {
    return document.createTextNode(text) as SimpleText;
  }

  createComment(text: string): SimpleComment {
    return document.createComment(text) as SimpleComment;
  }

  createDocumentFragment(text: string): SimpleDocumentFragment {
    return document.createDocumentFragment() as SimpleDocumentFragment;
  }

  getOffsetParent(): SimpleElement | null {
    return document.createElement('div').offsetParent as SimpleElement | null;
  }
}

export class CheckSerializable {
  createHTMLDocument(): SerializableNode {
    return document.implementation.createHTMLDocument('foo');
  }

  createElement(tagName: string): SerializableElement {
    return document.createElement(tagName);
  }
}
