import { moduleWithDocument } from '@simple-dom/dom-test-helper';

moduleWithDocument('Document', (helper) => {

  QUnit.test('creating a document node', (assert) => {
    const { document } = helper;

    // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
    assert.strictEqual(document.nodeType, 9, 'document has node type of 9');
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
    assert.strictEqual(document.nodeName, '#document', 'document node has the name #document');
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue
    assert.strictEqual(document.nodeValue, null, 'for the document itself, nodeValue returns null');

    // https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument
    assert.strictEqual(document.ownerDocument, null, 'for the document itself, ownerDocument returns null');

    assert.notStrictEqual(document.firstChild, null, 'has firstChild');
    if (document.firstChild !== null) {
      assert.strictEqual(document.firstChild.ownerDocument, document);
      assert.strictEqual(document.firstChild.nodeType, 10);
      assert.strictEqual(document.firstChild.nodeName, 'html');
      assert.strictEqual(document.doctype, document.firstChild, 'doctype is document.firstChild');
    }

    assert.notStrictEqual(document.lastChild, null, 'has lastChild');
    if (document.lastChild !== null) {
      assert.strictEqual(document.lastChild.ownerDocument, document);
      assert.strictEqual(document.lastChild.nodeType, 1);
      assert.strictEqual(document.lastChild.nodeName, 'HTML');
      assert.strictEqual(document.documentElement, document.lastChild, 'documentElement is document.lastChild');

      assert.notStrictEqual(document.documentElement.firstChild, null, 'documentElement has firstChild');
      if (document.documentElement.firstChild !== null) {
        assert.strictEqual(document.documentElement.firstChild.ownerDocument, document);
        assert.strictEqual(document.documentElement.firstChild.nodeType, 1);
        assert.strictEqual(document.documentElement.firstChild.nodeName, 'HEAD');
        assert.strictEqual(document.head, document.documentElement.firstChild, 'head is documentElement.firstChild');
      }

      assert.notStrictEqual(document.documentElement.lastChild, null, 'documentElement has firstChild');
      if (document.documentElement.lastChild !== null) {
        assert.strictEqual(document.documentElement.lastChild.ownerDocument, document);
        assert.strictEqual(document.documentElement.lastChild.nodeType, 1);
        assert.strictEqual(document.documentElement.lastChild.nodeName, 'BODY');
        assert.strictEqual(document.body, document.documentElement.lastChild, 'body is documentElement.firstChild');
      }
    }
  });

});
