/*globals window*/

import { element, fragment, text, html } from './support';
import Serializer from 'simple-dom/html-serializer';
import voidMap from 'simple-dom/void-map';

QUnit.module('Serializer', {
  beforeEach: function() {
    this.serializer = new Serializer(voidMap);
  }
});

QUnit.test('serializes single element correctly', function (assert) {
  var actual = this.serializer.serialize(element('div'));
  assert.equal(actual, '<div></div>');
});

QUnit.test('serializes element with attribute number value correctly', function (assert) {
  var actual = this.serializer.serialize(element('div', {"height": 500}));
  assert.equal(actual, '<div height="500"></div>');
});

QUnit.test('serializes single void element correctly', function (assert) {
  var actual = this.serializer.serialize(element('img', { src: 'foo' }));
  assert.equal(actual, '<img src="foo">');
});

QUnit.test('serializes complex tree correctly', function (assert) {
  var actual = this.serializer.serialize(fragment(
    element('div', { id: 'foo' },
      element('b', {},
        text('Foo & Bar')
      ),
      text('!'),
      element('img', { src: 'foo' })
    )
  ));
  assert.equal(actual, '<div id="foo"><b>Foo &amp; Bar</b>!<img src="foo"></div>');
});

QUnit.test('does not serialize siblings of an element', function (assert) {
  var html = element('html');
  var head = element('head');
  var body = element('body');

  head.appendChild(element('meta', { content: 'foo' }));
  head.appendChild(element('meta', { content: 'bar' }));

  html.appendChild(head);
  html.appendChild(body);

  var actual = this.serializer.serialize(head);
  assert.equal(actual, '<head><meta content="foo"><meta content="bar"></head>');

  actual = this.serializer.serialize(body);
  assert.equal(actual, '<body></body>');
});

// SimpleDOM supports an extension of the DOM API that allows inserting strings of
// unparsed, raw HTML into the document. When the document is subsequently serialized,
// the raw text of the HTML nodes is inserted into the HTML.
//
// This performance optimization allows users of SimpleDOM (like Ember's FastBoot) to insert
// raw HTML snippets into the final serialized output without requiring a parsing and
// reserialization round-trip.
if (typeof window === 'undefined') {
  QUnit.test('serializes raw HTML', function(assert) {
    var actual = this.serializer.serialize(fragment(
      element('div', { id: 'foo' },
        text('<p></p>')
      )
    ));

    assert.equal(actual, '<div id="foo">&lt;p&gt;&lt;/p&gt;</div>');

    actual = this.serializer.serialize(fragment(
      element('div', { id: 'foo' },
        html('<p></p>')
      )
    ));

    assert.equal(actual, '<div id="foo"><p></p></div>');
  });
}
