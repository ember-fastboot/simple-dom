import { runBoth } from './support';

runBoth((kind) => {

QUnit.module('Document');

QUnit.test('creating a document node', (assert) => {
  const { document } = kind.helper();

  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
  assert.strictEqual(document.nodeType, 9, 'document has node type of 9');
  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
  assert.strictEqual(document.nodeName, '#document', 'document node has the name #document');
  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue
  assert.strictEqual(document.nodeValue, null, 'for the document itself, nodeValue returns null');
});

});
