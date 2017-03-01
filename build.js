var stealTools = require("steal-tools");

stealTools.export({
	steal: {
		config: __dirname+"/package.json!npm"
	},
	outputs: {
		"+amd": {},
		"+global-js": {
			exports: { "micro-location": "Location" }
		},
		"+cjs": {}
	}
}).catch(function(e){
	
	setTimeout(function(){
		throw e;
	},1);
	
});

