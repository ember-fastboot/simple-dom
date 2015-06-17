/*globals window*/

import { element, fragment, text, html } from './support';
import Serializer from 'simple-dom/html-serializer';
import voidMap from 'simple-dom/void-map';

QUnit.module('Serializer', {
  beforeEach: function() {
    this.serializer = new Serializer(voidMap);
  }
});

QUnit.test('serializes correctly', function (assert) {
  var actual = this.serializer.serialize(fragment(
    element('div', { id:'foo' },
      element('b', {},
        text('Foo & Bar')
      )
    )
  ));
  assert.equal(actual, '<div id="foo"><b>Foo &amp; Bar</b></div>');
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
