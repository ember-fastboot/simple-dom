import {Document} from 'can-simple-dom';
import QUnit from 'steal-qunit';


import Parser from 'can-simple-dom/simple-dom/html-parser';
import voidMap from 'can-simple-dom/simple-dom/void-map';
import Serializer from 'can-simple-dom/simple-dom/html-serializer';

import tokenize from 'can-simple-dom/simple-dom/default-tokenize';

QUnit.module('Element with serialization and parsing');

QUnit.test("document.implementation is supported (#23)", function(){
  
  var document = new Document();
  document.__addSerializerAndParser(new Serializer(voidMap), new Parser(tokenize, document, voidMap));

  ok(document.implementation, "implementation exists");
  var doc2 = document.implementation.createHTMLDocument("");
  ok(doc2.body, "has a body");
});


