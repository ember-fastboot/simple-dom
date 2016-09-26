import Document from 'can-simple-dom/simple-dom/document';
import Serializer from 'can-simple-dom/simple-dom/html-serializer';
import voidMap from 'can-simple-dom/simple-dom/void-map';
import { element, fragment, text } from './support';
import QUnit from 'steal-qunit';

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
  var parent = element('div');

  var child1 = element('p');
  var child2 = element('img', { src: "hamster.png" });
  var child3 = element('span');

  parent.appendChild(child1);
  parent.appendChild(child2);
  parent.appendChild(child3);

  var child11 = text('hello');
  var child12 = element('span');
  child12.appendChild(text(' world'));
  var child13 = text('!');

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

  var actual = new Serializer(voidMap).serialize(fragment(clone));

  assert.equal(actual, '<div><p>hello<span> world</span>!</p><img src="hamster.png"><span></span></div>');
});

QUnit.test("anchor element is created successfully - micro-location works (see #11)", function (assert) {
  assert.expect(0);

  var document = new Document();

  try {
    document.createElement("a");
  } catch (ex) {
    assert.ok(false, "Anchor throws exception");
  }
});

QUnit.test("style.cssText is two way bound to the style attribute (#13)", function(assert){
  var document = new Document();
  var el = document.createElement('div');
  el.style.cssText = "color: green;";
  assert.equal(el.getAttribute("style"), "color: green;");
});

QUnit.test("replaceChild works", function(assert){
	var document = new Document();
	var parent = document.createElement('div');
	var one = document.createElement('p');
	var two = document.createElement('span');

	parent.appendChild(one);

	assert.equal(parent.firstChild.nodeName, 'P', 'first child is a p');

	var oldChild = parent.replaceChild(two, one);

	assert.equal(oldChild, one, 'correct return value');
	assert.equal(parent.firstChild.nodeName, 'SPAN', 'child is now the span');
});

QUnit.test("setAttribute('class', value) updates the className", function(assert){
	var document = new Document();
	var el = document.createElement("div");
	el.setAttribute("class", "foo bar");

	assert.equal(el.className, "foo bar", "Element's className is same as the attribute class");
});

QUnit.test("innerHTML does not parse the contents of SCRIPT and STYLE nodes", function (assert) {
  var document = new Document();
  var div = document.createElement("div");
  var script = document.createElement("script");

  try {
    div.innerHTML = "<span>foo</span>";
    ok(0, "should not make it here b/c no parser is shipped");
  } catch (ex) {
    ok(1, "tried to parse content");
  }

  var jsCode = "var foo = '<span>bar</span>';";
  try {
    script.innerHTML = jsCode;
    equal(script.firstChild, script.lastChild, "script has one child");
    equal(script.firstChild.nodeType, 3, "only child is a text node");
    equal(script.firstChild.nodeValue, jsCode, "code matches");
  } catch (ex) {
    ok(0, "should not cause an error")
  }
});

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1734834066
QUnit.test("removeChild should return the removed node", function(assert) {
	var document = new Document();

	var parent = document.createElement('div');

	var child = document.createElement('p');

	parent.appendChild(child);

	var removedNode = parent.removeChild(child);

	assert.strictEqual(removedNode, child, "removeChild should return the removed node");
});

QUnit.test("Input's type property is two-way bound to the attribute", function(assert){
	var document = new Document();
	var input = document.createElement("input");
	input.setAttribute("type", "text");

	assert.equal(input.type, "text");

	input.type = "radio";
	assert.equal(input.type, "radio");
	assert.equal(input.getAttribute("type"), "radio");
});

QUnit.test("Input's value property is two-way bound to the attribute", function(assert){
	var document = new Document();
	var input = document.createElement("input");
	input.setAttribute("value", "foo");

	assert.equal(input.value, "foo");

	input.value = "bar";
	assert.equal(input.value, "bar");
	assert.equal(input.getAttribute("value"), "bar");
});

QUnit.test("Input's checked value is two-way bound", function(assert){
	var document = new Document();
	var input = document.createElement("input");

	input.setAttribute("checked", "");
	assert.ok(input.checked);

	input.checked = false;
	assert.equal(input.hasAttribute("checked"), false);
	assert.equal(input.checked, false);
});

QUnit.test("Select's value attribute is two-way bound", function(assert){
	var document = new Document();
	var select = document.createElement("select");

	select.setAttribute("value", "foo");

	assert.equal(select.value, "foo");

	select.value = "bar";
	assert.equal(select.value, "bar");
	assert.equal(select.getAttribute("value"), "bar");
});
