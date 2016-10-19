import {Document} from 'can-simple-dom';
import QUnit from 'steal-qunit';


import Parser from 'can-simple-dom/simple-dom/html-parser';
import voidMap from 'can-simple-dom/simple-dom/void-map';
import Serializer from 'can-simple-dom/simple-dom/html-serializer';

import tokenize from 'can-simple-dom/simple-dom/default-tokenize';

QUnit.module('can-simple-dom - Element with serialization and parsing');

QUnit.test("document.implementation is supported (#23)", function(){
  
  var document = new Document();
  document.__addSerializerAndParser(new Serializer(voidMap), new Parser(tokenize, document, voidMap));

  ok(document.implementation, "implementation exists");
  var doc2 = document.implementation.createHTMLDocument("");
  ok(doc2.body, "has a body");
});

QUnit.test("innerHTML supported", function(){
  
  var document = new Document();
  document.__addSerializerAndParser(new Serializer(voidMap), new Parser(tokenize, document, voidMap));

  document.body.innerHTML = "<span class='bar'>HI</span>";
  
  QUnit.equal( document.body.firstChild.nodeName, "SPAN");
  QUnit.equal( document.body.firstChild.className, "bar");
  QUnit.equal( document.body.firstChild.firstChild.nodeValue, "HI");
  
  QUnit.equal( document.body.innerHTML, "<span class=\"bar\">HI</span>");
});

QUnit.test("outerHTML supported", function(){
  
  var document = new Document();
  document.__addSerializerAndParser(new Serializer(voidMap), new Parser(tokenize, document, voidMap));
 
  document.body.innerHTML = "<span/><div id='item'>HI</div><span/>";
  
  var item = document.getElementById('item');
  
  QUnit.equal( item.outerHTML, "<div id=\"item\">HI</div>", "getter");
  item.outerHTML = "<label>IT</label>";
  
  QUnit.equal( document.body.innerHTML,  "<span></span><label>IT</label><span></span>", "setter");
});
