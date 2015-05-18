var stealExport = require("steal-tools").export;

stealExport({
  system: {
    config: __dirname + "/package.json!npm"
  },
  config: {},
  outputs: {
    "+cjs": {}
  }
});
