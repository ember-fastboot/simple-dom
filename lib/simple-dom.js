import Node from './simple-dom/document/node';
import Element from './simple-dom/document/element';
import Document from './simple-dom/document';
import HTMLParser from './simple-dom/html-parser';
import HTMLSerializer from './simple-dom/html-serializer';
import voidMap from './simple-dom/void-map';

var SimpleDOM = {
  Node,
  Element,
  Document,
  HTMLParser,
  HTMLSerializer,
  voidMap
};

if(typeof window !== "undefined") {
	window.SimpleDOM = SimpleDOM;
}

export default SimpleDOM;
