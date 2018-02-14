let createDocument = require('@simple-dom/document');
let HTMLParser = require('@simple-dom/parser');
let HTMLSerializer = require('@simple-dom/serializer');
let voidMap = require('@simple-dom/void-map');
let Tokenizer = require('simple-html-tokenizer');
let fs = require('fs');
let doc = createDocument();
let parser = new HTMLParser(Tokenizer.tokenize, doc, voidMap);

let ast = parser.parse(fs.readFileSync('./benches/foo.txt', 'utf8'));
let serializer = new HTMLSerializer(voidMap);

module.exports = { ast, serializer };
