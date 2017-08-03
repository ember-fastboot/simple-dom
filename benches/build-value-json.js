let SimpleDOM = require('../dist/simple-dom');
let Tokenizer = require('simple-html-tokenizer');
let fs = require('fs');
let doc = new SimpleDOM.Document();
let parser = new SimpleDOM.HTMLParser(Tokenizer.tokenize, doc, SimpleDOM.voidMap);

let ast = parser.parse(fs.readFileSync('./benches/foo.txt', 'utf8'));

let textValues = [];
let attrValues = [];
visit(ast);

fs.writeFileSync('benches/text-node-values.json', JSON.stringify(textValues, null, 2));
fs.writeFileSync('benches/attribute-values.json', JSON.stringify(attrValues, null, 2));

function visit(node) {
  if (node.nodeType === 3) {
    textValues.push(node.nodeValue);
  }
  if (node.nodeType === 1) {
    for (let i = 0; i < node.attributes.length; i++) {
      attrValues.push(node.attributes[i].value);
    }
  }

  if (node.firstChild !== null) {
    visit(node.firstChild);
  }
  if (node.nextSibling !== null) {
    visit(node.nextSibling);
  }
}