import { document } from './support';

import Parser from 'simple-dom/html-parser';
import voidMap from 'simple-dom/void-map';
import HTMLTokenizer from 'simple-html-tokenizer/tokenizer';
import EntityParser from 'simple-html-tokenizer/entity-parser';
// make test rebuilds fast
import namedCodepoints from 'simple-html-tokenizer/char-refs/min';

function tokenize(input) {
  // TODO: make Tokenizer take input on the tokenize method like tokenizePart
  // just init state, I'd rather pass in the tokenizer instance and call tokenize(input)
  var tokenizer = new HTMLTokenizer(input, new EntityParser(namedCodepoints));
  return tokenizer.tokenize();
}

QUnit.module('Basic HTML parsing', {
  beforeEach: function() {
    this.parser = new Parser(tokenize, document, voidMap);
  }
});

QUnit.test('simple parse', function (assert) {
  var fragment = this.parser.parse('<div>Hello</div>');
  assert.ok(fragment);

  var node = fragment.firstChild;
  assert.ok(node);
  assert.equal(node.nodeType, 1);
  assert.equal(node.nodeName.toLowerCase(), 'div');
  assert.ok(node.firstChild);
  assert.equal(node.firstChild.nodeType, 3);
  assert.equal(node.firstChild.nodeValue, 'Hello');
});

QUnit.test('nested parse', function (assert) {
  var fragment = this.parser.parse('text before<div>Hello</div>text between<div id=foo title="Hello World">World</div>text after');
  assert.ok(fragment);

  var node = fragment.firstChild;
  assert.ok(node);
  assert.equal(node.nodeType, 3);
  assert.equal(node.nodeValue, 'text before');

  node = node.nextSibling;
  assert.ok(node);
  assert.equal(node.nodeType, 1);
  assert.equal(node.nodeName, 'DIV');
  assert.ok(node.firstChild);
  assert.equal(node.firstChild.nodeType, 3);
  assert.equal(node.firstChild.nodeValue, 'Hello');

  node = node.nextSibling;
  assert.ok(node);
  assert.equal(node.nodeType, 3);
  assert.equal(node.nodeValue, 'text between');

  node = node.nextSibling;
  assert.ok(node);
  assert.equal(node.nodeType, 1);
  assert.equal(node.nodeName, 'DIV');
  var expectedValues = {
    id: 'foo',
    title: 'Hello World'
  };
  assert.equal(node.attributes.length, 2);
  assert.equal(node.attributes[0].value, expectedValues[node.attributes[0].name]);
  assert.equal(node.attributes[1].value, expectedValues[node.attributes[1].name]);
  assert.equal(node.attributes.length, 2);
  assert.ok(node.firstChild);
  assert.equal(node.firstChild.nodeType, 3);
  assert.equal(node.firstChild.nodeValue, 'World');

  node = node.nextSibling;
  assert.ok(node);
  assert.equal(node.nodeType, 3);
  assert.equal(node.nodeValue, 'text after');
});

QUnit.test('void tags', function (assert) {
  var fragment = this.parser.parse('<div>Hello<br>World<img src="http://example.com/image.png"></div>');
  assert.ok(fragment);
  var node = fragment.firstChild;
  assert.ok(node);
  assert.equal(node.nodeType, 1);
  assert.equal(node.nodeName, 'DIV');
  node = node.firstChild;
  assert.ok(node);
  assert.equal(node.nodeType, 3);
  assert.equal(node.nodeValue, 'Hello');
  node = node.nextSibling;
  assert.ok(node);
  assert.equal(node.nodeType, 1);
  assert.equal(node.nodeName, 'BR');
  node = node.nextSibling;
  assert.ok(node);
  assert.equal(node.nodeType, 3);
  assert.equal(node.nodeValue, 'World');
  node = node.nextSibling;
  assert.ok(node);
  assert.equal(node.nodeType, 1);
  assert.equal(node.nodeName, 'IMG');
  assert.equal(node.getAttribute('src'), 'http://example.com/image.png');
  assert.equal(node.nextSibling, null);
});
