import Element from './element';
import { propToAttr } from './utils';

function OptionElement(tagName, ownerDocument) {
	this.elementConstructor(tagName, ownerDocument);
}

OptionElement.prototype = Object.create(Element.prototype);
OptionElement.prototype.constructor = OptionElement;
OptionElement.prototype.elementConstructor = Element;

propToAttr(OptionElement, "value");

Object.defineProperty(OptionElement.prototype, "selected", {
	get: function(){
		var val = this.value || null;
		var parent = this.parentNode;
		return parent && parent.value == val;
	},
	set: function(val){
		if(val) {
			var parent = this.parentNode;
			if(parent) {
				parent.value = this.value;
			}
		}
	}
});


export default OptionElement;
