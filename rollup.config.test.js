import { resolve } from 'path';

const ENTRY = resolve('lib/simple-dom.js');
const EXPORTS = ['Node', 'Element', 'DocumentFragment', 'Document', 'HTMLParser', 'HTMLSerializer', 'voidMap'];

export default {
  input: 'test/index.js',
  name: 'SimpleDOMTests',
  plugins: [
    {
      name: 'resolve modules (local and from simple-html-tokenizer)',
      resolveId(id) {
        if (id === 'simple-dom') {
          return ENTRY;
        }
      },
      load(id) {
        if (id === ENTRY) {
          return {
            code: `var index = typeof SimpleDOM === 'undefined' ? require('./simple-dom.js') : SimpleDOM;` +
              EXPORTS.map((name) => `export var ${name} = index.${name};`).join('\n'),
            map: { mappings: '' }};
        }
      }
    }
  ],
  globals: {
    'simple-html-tokenizer': 'HTML5Tokenizer',
  },
  external: ['simple-html-tokenizer'],
  sourcemap: true,
  output: {
    file: 'dist/simple-dom-test.js',
    format: 'umd',
  },
};
