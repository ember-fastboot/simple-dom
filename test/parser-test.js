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
  var nodes = this.parser.parse('<div>Hello</div>');
  assert.ok(nodes);
  assert.equal(nodes.length, 1);
  var node = nodes[0];
  assert.equal(node.nodeType, 1);
  assert.equal(node.nodeName.toLowerCase(), 'div');
  assert.ok(node.firstChild);
  assert.equal(node.firstChild.nodeType, 3);
  assert.equal(node.firstChild.nodeValue, 'Hello');
});

QUnit.test('nested parse', function (assert) {
  var nodes = this.parser.parse('text before<div>Hello</div>text between<div id=foo title="Hello World">World</div>text after');
  assert.ok(nodes);
  assert.equal(nodes.length, 5);
  assert.equal(nodes[0].nodeType, 3);
  assert.equal(nodes[0].nodeValue, 'text before');
  assert.equal(nodes[1].nodeType, 1);
  assert.equal(nodes[1].nodeName, 'DIV');
  assert.ok(nodes[1].firstChild);
  assert.equal(nodes[1].firstChild.nodeType, 3);
  assert.equal(nodes[1].firstChild.nodeValue, 'Hello');
  assert.equal(nodes[2].nodeType, 3);
  assert.equal(nodes[2].nodeValue, 'text between');
  assert.equal(nodes[3].nodeType, 1);
  assert.equal(nodes[3].nodeName, 'DIV');
  var expectedValues = {
    id: 'foo',
    title: 'Hello World'
  };
  assert.equal(nodes[3].attributes.length, 2);
  assert.equal(nodes[3].attributes[0].value, expectedValues[nodes[3].attributes[0].name]);
  assert.equal(nodes[3].attributes[1].value, expectedValues[nodes[3].attributes[1].name]);
  assert.equal(nodes[3].attributes.length, 2);
  assert.ok(nodes[3].firstChild);
  assert.equal(nodes[3].firstChild.nodeType, 3);
  assert.equal(nodes[3].firstChild.nodeValue, 'World');
  assert.equal(nodes[4].nodeType, 3);
  assert.equal(nodes[4].nodeValue, 'text after');
});

QUnit.test('void tags', function (assert) {
  var nodes = this.parser.parse('<div>Hello<br>World<img src="http://example.com/image.png"></div>');
  assert.ok(nodes);
  assert.equal(nodes.length, 1);
  var node = nodes[0];
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
