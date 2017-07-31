import { Node } from 'simple-dom';

QUnit.module('Node');

QUnit.test("#insertBefore", function(assert) {
  var body = new Node(1, 'body');
  var div = new Node(1, 'div');
  var span = new Node(1, 'span');
  var ul = new Node(1, 'ul');
  span.previousSibling = new Node(1, 'p');
  var appendChildReturn = body.appendChild(div);

  assert.strictEqual(appendChildReturn, div, 'appendChild should return the node it is appending');

  body.insertBefore(span, div);
  assert.strictEqual(span.parentNode, body, "nodes parent is set");
  assert.strictEqual(span.previousSibling, null, "nodes previous sibling is cleared");
  assert.strictEqual(span.nextSibling, div, "nodes next sibling is set");
  assert.strictEqual(div.previousSibling, span, "next sibling's previous sibling is set");
  assert.strictEqual(div.nextSibling, null, "next sibling's next sibling is set");
  assert.strictEqual(div.parentNode, body, "next sibling's parent is set");
  assert.strictEqual(body.firstChild, span, "parents first child is set");
  assert.strictEqual(body.lastChild, div, "parents last child is set");
});
