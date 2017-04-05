import QUnit from 'steal-qunit';
import CSSStyleDeclaration from 'can-simple-dom/simple-dom/document/style';

QUnit.module("can-simple-dom - CSStyleDeclaration");

QUnit.test("cssText is enumerable", function(){
	var proto = CSSStyleDeclaration.prototype;
	var descriptor = Object.getOwnPropertyDescriptor(proto, "cssText");
	QUnit.equal(descriptor.enumerable, true, "it is enumerable");
});

QUnit.test("cssText is configurable", function(){
	var proto = CSSStyleDeclaration.prototype;
	var descriptor = Object.getOwnPropertyDescriptor(proto, "cssText");
	QUnit.equal(descriptor.configurable, true, "it is configurable");
});
