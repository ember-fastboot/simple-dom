

export function propToAttr(Element, name){
	Object.defineProperty(Element.prototype, name, {
		get: function(){
			return this.getAttribute(name);
		},
		set: function(val){
			this.setAttribute(name, val);
		}
	});
};
