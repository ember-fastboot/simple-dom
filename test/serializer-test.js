/*globals window*/

import { element, fragment, text, cdata } from './support';
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

// The CDATA DOM APIs are only available in XML documents, not HTML. For the
// SimpleDOM case, we support the ability to store unparsed HTML in the DOM
// tree. This is useful for environments where the output target is serialized
// HTML, so we can avoid round-tripping from HTML to DOM and back to HTML for
// no gain.
if (typeof window.document !== 'undefined' && window.document.createCDATAFragment) {
  QUnit.test('serializes CDATA nodes correctly', function(assert) {
    var actual = this.serializer.serialize(fragment(
      element('div', { id: 'foo' },
        text('<p></p>')
      )
    ));

    assert.equal(actual, '<div id="foo">&lt;p&gt;&lt;/p&gt;</div>');

    actual = this.serializer.serialize(fragment(
      element('div', { id: 'foo' },
        cdata('<p></p>')
      )
    ));

    assert.equal(actual, '<div id="foo"><p></p></div>');
  });
}
