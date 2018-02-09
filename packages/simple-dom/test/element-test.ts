import { DocumentFragment } from '@simple-dom/document';
import Serializer from '@simple-dom/serializer';
import voidMap from '@simple-dom/void-map';
import { runBoth } from './support';

runBoth((kind) => {
QUnit.module('Element');

// See http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-core.html#ID-B63ED1A3
// tslint:disable-next-line:max-line-length
QUnit.test('appending a document fragment appends the fragment\'s children and not the fragment itself', (assert) => {
  const { document } = kind.helper();

  const frag = document.createDocumentFragment();
  const elem = document.createElement('div');
  const body = document.body;

  assert.strictEqual(body.firstChild, null, 'body has no children');

  frag.appendChild(elem);
  body.appendChild(frag);

  assert.strictEqual(body.firstChild!.nodeName, 'DIV', 'fragment\'s child is added as child of document');
});

// See http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-core.html#ID-B63ED1A3
// tslint:disable-next-line:max-line-length
QUnit.test('appending a document fragment (via insertBefore) appends the fragment\'s children and not the fragment itself', (assert) => {
  const { document } = kind.helper();

  const frag = document.createDocumentFragment();
  const elem = document.createElement('div');
  const existing = document.createElement('main');
  const body = document.body;
  body.appendChild(existing);

  assert.strictEqual(body.firstChild!.nodeName, 'MAIN', 'sanity check: the main element was actually inserted');
  assert.strictEqual(body.lastChild!.nodeName, 'MAIN', 'sanity check: the main element was actually inserted');

  frag.appendChild(elem);
  body.insertBefore(frag, existing);

  assert.strictEqual(body.firstChild!.nodeName, 'DIV', 'The body\'s first child is now DIV');
  assert.strictEqual(body.lastChild!.nodeName, 'MAIN', 'The body\'s last child is now MAIN');
});

QUnit.test('insert a document fragment before a node with a previousSibling', (assert) => {
  const { document } = kind.helper();

  const parent = document.createElement('div');
  const before = document.createComment('before');
  const after = document.createComment('after');
  parent.appendChild(before);
  parent.appendChild(after);

  const frag = document.createDocumentFragment();
  const child1 = document.createElement('p');
  const child2 = document.createElement('p');
  frag.appendChild(child1);
  frag.appendChild(child2);

  assert.strictEqual(after.previousSibling, before);

  parent.insertBefore(frag, after);

  assert.strictEqual(frag.firstChild, null);
  assert.strictEqual(frag.lastChild, null);

  assert.strictEqual(child1.parentNode, parent);
  assert.strictEqual(child2.parentNode, parent);

  assert.strictEqual(before.previousSibling, null);
  assert.strictEqual(before.nextSibling,     child1);
  assert.strictEqual(child1.previousSibling, before);
  assert.strictEqual(child1.nextSibling,     child2);
  assert.strictEqual(child2.previousSibling, child1);
  assert.strictEqual(child2.nextSibling,     after);
  assert.strictEqual(after.previousSibling,  child2);
  assert.strictEqual(after.nextSibling,      null);
});

QUnit.test('insert an empty document fragment does nothing', (assert) => {
  const { document } = kind.helper();

  const parent = document.createElement('div');
  const before = document.createComment('before');
  const after = document.createComment('after');
  parent.appendChild(before);
  parent.appendChild(after);

  const frag = document.createDocumentFragment();

  parent.insertBefore(frag, after);

  assert.strictEqual(parent.firstChild, before);
  assert.strictEqual(parent.lastChild, after);
  assert.strictEqual(before.nextSibling,     after);
  assert.strictEqual(after.previousSibling,  before);
  assert.strictEqual(after.nextSibling,      null);
});

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-536297177
QUnit.test('child nodes can be access via item()', (assert) => {
  const { document } = kind.helper();

  const parent = document.createElement('div');

  const child1 = document.createElement('p');
  const child2 = document.createElement('img');

  // tslint:disable-next-line:max-line-length
  assert.strictEqual(parent.childNodes.item(0), null, 'attempting to access an item that doesn\'t exist returns null');

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

QUnit.test('insertBefore can insert before the last child node', (assert) => {
  const { document } = kind.helper();

  const parent = document.createElement('div');

  const child1 = document.createElement('p');
  const child2 = document.createElement('img');
  const child3 = document.createElement('span');

  parent.appendChild(child1);
  parent.appendChild(child2);

  parent.insertBefore(child3, child2);

  assert.strictEqual(parent.childNodes.item(1), child3);
});

QUnit.test('insertBefore removes the node from its parent before inserting', (assert) => {
  const { document } = kind.helper();

  const body = document.body;

  const parent = document.createElement('div');
  const child =  document.createElement('span');
  parent.appendChild(child);
  body.appendChild(parent);

  assert.strictEqual(parent.firstChild, child, 'precond - parent.firstChild === child');
  assert.strictEqual(parent.lastChild, child, 'precond - parent.lastChild === child');
  assert.strictEqual(body.firstChild, parent, 'precond - body.firstChild === parent');

  document.body.insertBefore(child, body.firstChild);

  assert.strictEqual(body.firstChild, child, 'body firstChild replaced with child');
  assert.strictEqual(child.parentNode, body, 'child parentNode updated to body');
  assert.strictEqual(parent.firstChild, null, 'child removed from parent (firstChild)');
  assert.strictEqual(parent.lastChild, null, 'child removed from parent (lastChild)');
});

QUnit.test('cloneNode(true) recursively clones nodes', (assert) => {
  const { document, insertAdjacentHTML } = kind.helper();

  const parent = document.createElement('div');

  const child1 = document.createElement('p');
  const child2 = document.createElement('img');
  child2.setAttribute('src', 'hamster.png');
  const child3 = document.createElement('span');
  const child31 = document.createComment('');
  child3.appendChild(child31);

  insertAdjacentHTML(child3, 'beforeend', '<p data-attr="herp">derp</p>');

  parent.appendChild(child1);
  parent.appendChild(child2);
  parent.appendChild(child3);

  const child11 = document.createTextNode('hello');
  const child12 = document.createElement('span');
  child12.appendChild(document.createTextNode(' world'));
  const child13 = document.createTextNode('!');

  child1.appendChild(child11);
  child1.appendChild(child12);
  child1.appendChild(child13);

  const clone = parent.cloneNode(true);

  assert.notEqual(parent.firstChild, null);
  assert.notStrictEqual(clone.firstChild, parent.firstChild);

  const clone2 = parent.cloneNode(true);

  assert.notEqual(parent.firstChild, null);
  assert.notStrictEqual(clone2.firstChild, clone.firstChild);
  assert.notStrictEqual(clone2.firstChild, parent.firstChild);

  let fragment = document.createDocumentFragment();
  fragment.appendChild(clone);

  fragment = fragment.cloneNode(true) as DocumentFragment;

  const actual = new Serializer(voidMap).serialize(fragment);

  // tslint:disable-next-line:max-line-length
  assert.equal(actual, '<div><p>hello<span> world</span>!</p><img src="hamster.png"><span><!----><p data-attr="herp">derp</p></span></div>');
});

QUnit.test('head + metatags', (assert) => {
  const { document } = kind.helper();

  const meta = document.createElement('meta');
  meta.setAttribute('name', 'description');
  meta.setAttribute('content', 'something here');

  const head = document.head;
  head.appendChild(meta);

  const actual = new Serializer(voidMap).serialize(head.firstChild!);

  assert.strictEqual(head.firstChild!.nodeName, 'META', 'sanity check: the meta element was actually inserted');
  assert.equal(actual, '<meta name="description" content="something here">');
});

QUnit.test('setAttribute converts non strings', (assert) => {
  const { document } = kind.helper();

  const div = document.createElement('div');
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

QUnit.test('removeAttribute', (assert) => {
  const { document } = kind.helper();
  const div = document.createElement('div');
  div.setAttribute('a', 'something');
  div.setAttribute('b', 'something else');
  assert.strictEqual(div.getAttribute('a'), 'something');
  assert.strictEqual(div.getAttribute('b'), 'something else');
  div.removeAttribute('b');
  assert.strictEqual(div.getAttribute('a'), 'something');
  assert.strictEqual(div.getAttribute('b'), null);
  div.removeAttribute('a');
  assert.strictEqual(div.getAttribute('a'), null);
  assert.strictEqual(div.getAttribute('b'), null);
});

});
