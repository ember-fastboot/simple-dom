let SimpleDOM = require('../dist/simple-dom');
let Tokenizer = require('simple-html-tokenizer');
let fs = require('fs');
let doc = new SimpleDOM.Document();
let parser = new SimpleDOM.HTMLParser(Tokenizer.tokenize, doc, SimpleDOM.voidMap);

let ast = parser.parse(fs.readFileSync('./benches/foo.txt', 'utf8'));
let serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

module.exports = { ast, serializer };
