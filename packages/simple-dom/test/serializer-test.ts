import Serializer from '@simple-dom/serializer';
import voidMap from '@simple-dom/void-map';
import { runBoth } from './support';

runBoth((kind) => {

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
  const { element } = kind.helper();
  const actual = serializer.serialize(element('div'));
  assert.equal(actual, '<div></div>');
});

QUnit.test('serializes element with attribute number value correctly', (assert) => {
  const { element } = kind.helper();
  const actual = serializer.serialize(element('div', {
    height: 500,
  }));
  assert.equal(actual, '<div height="500"></div>');
});

QUnit.test('serializes single void element correctly', (assert) => {
  const { element } = kind.helper();
  const actual = serializer.serialize(element('img', { src: 'foo' }));
  assert.equal(actual, '<img src="foo">');
});

QUnit.test('serializes complex tree correctly', (assert) => {
  const { element, fragment, text } = kind.helper();
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
  const { element } = kind.helper();
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
  const { element, fragment, text } = kind.helper();
  const actual = serializer.serializeChildren(fragment(
    element('div', { id: 'foo' },
      element('b', {},
        text('Foo & Bar')),
      text('!'),
      element('img', { src: 'foo' }))).firstChild!);
  assert.equal(actual, '<b>Foo &amp; Bar</b>!<img src="foo">');
});

QUnit.test('serializes raw HTML', (assert) => {
  const { element, fragment, text, insertAdjacentHTML } = kind.helper();
  let actual = serializer.serialize(fragment(
    element('div', { id: 'foo' },
      text('<p></p>'))));

  assert.equal(actual, '<div id="foo">&lt;p&gt;&lt;/p&gt;</div>');

  actual = serializer.serialize(fragment(insertAdjacentHTML(
    element('div', { id: 'foo' }), 'afterbegin', '<p></p>')));

  assert.equal(actual, '<div id="foo"><p></p></div>');
});

});
