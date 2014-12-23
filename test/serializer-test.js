import { element, fragment, text } from './support';
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