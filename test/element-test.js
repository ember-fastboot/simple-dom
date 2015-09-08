import Document from 'simple-dom/document';
import Serializer from 'simple-dom/html-serializer';
import voidMap from 'simple-dom/void-map';

QUnit.module('Element');

// See http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-core.html#ID-B63ED1A3
QUnit.test("appending a document fragment appends the fragment's children and not the fragment itself", function(assert) {
  var document = new Document();

  var frag = document.createDocumentFragment();
  var elem = document.createElement('div');
  var body = document.body;

  assert.strictEqual(body.firstChild, null, "body has no children");

  frag.appendChild(elem);
  body.appendChild(frag);

  assert.strictEqual(body.firstChild.tagName, "DIV", "fragment's child is added as child of document");
});

// See http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-core.html#ID-B63ED1A3
QUnit.test("appending a document fragment (via insertBefore) appends the fragment's children and not the fragment itself", function(assert) {
  var document = new Document();

  var frag = document.createDocumentFragment();
  var elem = document.createElement('div');
  var existing = document.createElement('main');
  var body = document.body;
  body.appendChild(existing);

  assert.strictEqual(body.firstChild.tagName, "MAIN", "sanity check: the main element was actually inserted");
  assert.strictEqual(body.lastChild.tagName, "MAIN", "sanity check: the main element was actually inserted");

  frag.appendChild(elem);
  body.insertBefore(frag, existing);

  assert.strictEqual(body.firstChild.tagName, "DIV", "The body's first child is now DIV");
  assert.strictEqual(body.lastChild.tagName, "MAIN", "The body's last child is now MAIN");
});

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-536297177
QUnit.test("child nodes can be access via item()", function(assert) {
  var document = new Document();

  var parent = document.createElement('div');

  var child1 = document.createElement('p');
  var child2 = document.createElement('img');

  assert.strictEqual(parent.childNodes.item(0), null, "attempting to access an item that doesn't exist returns null");

  parent.appendChild(child1);
  parent.appendChild(child2);

  assert.strictEqual(parent.childNodes.item(0), child1);
  assert.strictEqual(parent.childNodes.item(1), child2);
  assert.strictEqual(parent.childNodes.item(2), null);

  parent.removeChild(child1);
  assert.strictEqual(parent.childNodes.item(0), child2);
  assert.strictEqual(parent.childNodes.item(1), null);

  parent.removeChild(child2);

  assert.strictEqual(parent.childNodes.item(0), null);
  assert.strictEqual(parent.childNodes.item(1), null);
});

QUnit.test("insertBefore can insert before the last child node", function(assert) {
  var document = new Document();

  var parent = document.createElement('div');

  var child1 = document.createElement('p');
  var child2 = document.createElement('img');
  var child3 = document.createElement('span');

  parent.appendChild(child1);
  parent.appendChild(child2);

  parent.insertBefore(child3, child2);

  assert.strictEqual(parent.childNodes.item(1), child3);
});

QUnit.test("cloneNode(true) recursively clones nodes", function(assert) {
  var document = new Document();
  var parent = document.createElement('div');

  var child1 = document.createElement('p');
  var child2 = document.createElement('img');
  child2.setAttribute('src', 'hamster.png');
  var child3 = document.createElement('span');

  parent.appendChild(child1);
  parent.appendChild(child2);
  parent.appendChild(child3);

  var child11 = document.createTextNode('hello');
  var child12 = document.createElement('span');
  child12.appendChild(document.createTextNode(' world'));
  var child13 = document.createTextNode('!');

  child1.appendChild(child11);
  child1.appendChild(child12);
  child1.appendChild(child13);

  var clone = parent.cloneNode(true);

  assert.notEqual(parent.firstChild, null);
  assert.notStrictEqual(clone.firstChild, parent.firstChild);

  var clone2 = parent.cloneNode(true);

  assert.notEqual(parent.firstChild, null);
  assert.notStrictEqual(clone2.firstChild, clone.firstChild);
  assert.notStrictEqual(clone2.firstChild, parent.firstChild);

  var fragment = document.createDocumentFragment();
  fragment.appendChild(clone);

  var actual = new Serializer(voidMap).serialize(fragment);

  assert.equal(actual, '<div><p>hello<span> world</span>!</p><img src="hamster.png"><span></span></div>');
});

QUnit.test("head + metatags", function(assert) {
  var document = new Document();

  var meta = document.createElement('meta');
  meta.setAttribute('name', 'description');
  meta.setAttribute('content', 'something here');

  var head = document.head;
  head.appendChild(meta);

  var actual = new Serializer(voidMap).serialize(head.firstChild);

  assert.strictEqual(head.firstChild.tagName, "META", "sanity check: the meta element was actually inserted");
  assert.equal(actual, '<meta name="description" content="something here">');
});

QUnit.test("setAttribute converts non strings", function (assert) {
  var document = new Document();

  var div = document.createElement('div');
  div.setAttribute('a', 0);
  assert.strictEqual(div.getAttribute('a'), '0');
  div.setAttribute('a', 1);
  assert.strictEqual(div.getAttribute('a'), '1');
  div.setAttribute('a', null);
  assert.strictEqual(div.getAttribute('a'), 'null');
  div.setAttribute('a', undefined);
  assert.strictEqual(div.getAttribute('a'), 'undefined');
  div.setAttribute('a', true);
  assert.strictEqual(div.getAttribute('a'), 'true');
  div.setAttribute('a', false);
  assert.strictEqual(div.getAttribute('a'), 'false');
});
