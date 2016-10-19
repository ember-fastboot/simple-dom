import Document from 'can-simple-dom/simple-dom/document';
import Serializer from 'can-simple-dom/simple-dom/html-serializer';
import voidMap from 'can-simple-dom/simple-dom/void-map';
import { element, fragment, text } from './support';
import QUnit from 'steal-qunit';

QUnit.module('can-simple-dom - Event');

QUnit.test("basic bubbling", 4,function(assert) {
  var document = new Document();

  var elem = document.createElement('div');

  document.body.appendChild(elem);

  document.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, document, "document current target");
  });
  document.documentElement.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, document.documentElement, "documentElement current target");
  });
  document.body.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, document.body, "body current target");
  });
  elem.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, elem, "elem current target");
  });

  document.body.appendChild(elem);

  var ev = document.createEvent('HTMLEvents');

  ev.initEvent("foo", true, false);

  elem.dispatchEvent(ev);
});

QUnit.test("stop propagation", 2,function(assert) {
  var document = new Document();

  var elem = document.createElement('div');

  document.body.appendChild(elem);

  document.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, document, "document current target");
  });
  document.documentElement.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, document.documentElement, "documentElement current target");
  });
  document.body.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, document.body, "body current target");
	  event.stopPropagation();
  });
  elem.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, elem, "elem current target");
  });

  document.body.appendChild(elem);

  var ev = document.createEvent('HTMLEvents');

  ev.initEvent("foo", true, false);

  elem.dispatchEvent(ev);
});

QUnit.test("initEvent without bubbling", 2,function(assert) {
  var document = new Document();

  var elem = document.createElement('div');

  document.body.appendChild(elem);

  document.body.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, document.body, "body current target");
	  event.stopPropagation();
  });
  elem.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, elem, "elem current target");
  });
  elem.addEventListener("foo", function(event){
	  assert.strictEqual( event.currentTarget, elem, "elem current target");
  });

  document.body.appendChild(elem);

  var ev = document.createEvent('HTMLEvents');

  ev.initEvent("foo", false, false);

  elem.dispatchEvent(ev);
});

QUnit.test("this inside event handler", function(assert) {
  var document = new Document();

  var elem = document.createElement('div');

  document.body.appendChild(elem);

  elem.addEventListener("foo", function(){
	assert.equal(this, elem, "this is the element");
  });

  var ev = document.createEvent('HTMLEvents');
  ev.initEvent("foo", true, false);

  elem.dispatchEvent(ev);
});

