/*globals window*/
import Serializer from '@simple-dom/serializer';
import voidMap from '@simple-dom/void-map';
import { element, fragment, html, text } from './support';

declare const window: any;

let serializer: Serializer;
QUnit.module('Serializer', {
  beforeEach() {
    serializer = new Serializer(voidMap);
  },
  afterEach() {
    serializer = undefined as any;
  },
});

QUnit.test('serializes single element correctly', (assert) => {
  const actual = serializer.serialize(element('div'));
  assert.equal(actual, '<div></div>');
});

QUnit.test('serializes element with attribute number value correctly', (assert) => {
  const actual = serializer.serialize(element('div', {
    height: 500,
  }));
  assert.equal(actual, '<div height="500"></div>');
});

QUnit.test('serializes single void element correctly', (assert) => {
  const actual = serializer.serialize(element('img', { src: 'foo' }));
  assert.equal(actual, '<img src="foo">');
});

QUnit.test('serializes complex tree correctly', (assert) => {
  const actual = serializer.serialize(fragment(
    element('div', { id: 'foo' },
      element('b', {},
        text('Foo & Bar'),
      ),
      text('!'),
      element('img', { src: 'foo' }),
    ),
  ));
  assert.equal(actual, '<div id="foo"><b>Foo &amp; Bar</b>!<img src="foo"></div>');
});

QUnit.test('does not serialize siblings of an element', (assert) => {
  const htmlEl = element('html');
  const head = element('head');
  const body = element('body');

  head.appendChild(element('meta', { content: 'foo' }));
  head.appendChild(element('meta', { content: 'bar' }));

  htmlEl.appendChild(head);
  htmlEl.appendChild(body);

  let actual = serializer.serialize(head);
  assert.equal(actual, '<head><meta content="foo"><meta content="bar"></head>');

  actual = serializer.serialize(body);
  assert.equal(actual, '<body></body>');
});

QUnit.test('serializes children but not self', (assert) => {
  const actual = serializer.serializeChildren(fragment(
    element('div', { id: 'foo' },
      element('b', {},
        text('Foo & Bar')),
      text('!'),
      element('img', { src: 'foo' }))).firstChild!);
  assert.equal(actual, '<b>Foo &amp; Bar</b>!<img src="foo">');
});

// SimpleDOM supports an extension of the DOM API that allows inserting strings of
// unparsed, raw HTML into the document. When the document is subsequently serialized,
// the raw text of the HTML nodes is inserted into the HTML.
//
// This performance optimization allows users of SimpleDOM (like Ember's FastBoot) to insert
// raw HTML snippets into the final serialized output without requiring a parsing and
// reserialization round-trip.
if (typeof window === 'undefined') {
  QUnit.test('serializes raw HTML', (assert) => {
    let actual = serializer.serialize(fragment(
      element('div', { id: 'foo' },
        text('<p></p>'))));

    assert.equal(actual, '<div id="foo">&lt;p&gt;&lt;/p&gt;</div>');

    actual = serializer.serialize(fragment(
      element('div', { id: 'foo' },
        html('<p></p>'))));

    assert.equal(actual, '<div id="foo"><p></p></div>');
  });
}
