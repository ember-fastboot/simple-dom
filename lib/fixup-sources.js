'use strict';
const path = require('path');
const Filter = require('broccoli-persistent-filter');

module.exports = class FixupSources extends Filter {
  constructor(inputNode, prefix) {
    super(inputNode, {
      extensions: ['map'],
      targetExtension: 'map'
    });
    this.prefix = prefix;
  }

  processString(content, relativePath) {
    let map = JSON.parse(content);
    for (let i = 0; i < map.sources.length; i++) {
      let source = map.sources[i];
      map.sources[i] = path.join(this.prefix, relativePath, '..', source);
    }
    return JSON.stringify(map);
  }
}
