'use strict';
const fs = require('fs');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const tee = require('broccoli-tee');
const build = require('./lib/build');

module.exports = function () {
  const workspaces = require('./package').workspaces.filter((workspace) => {
    return fs.existsSync(`${__dirname}/${workspace}/src`);
  });

  const src = mergeTrees(workspaces.map(build.funnelSrc), {
    annotation: 'merge workspace src',
  });

  const compiled = build.compileSrc(src);

  const qunit = new Funnel('node_modules/qunit/qunit', {
    include: ['qunit.js', 'qunit.css']
  });

  const loader = new Funnel('node_modules/loader.js/dist/loader', {
    include: ['loader.js']
  });

  const simpleHTMLTokenizer = new Funnel('node_modules/simple-html-tokenizer/dist', {
    include: ['simple-html-tokenizer.js']
  });

  return mergeTrees([qunit, loader, simpleHTMLTokenizer, 'test'].concat(workspaces.map((workspace) => {
    const dist = build.packageDist(compiled, workspace);

    tee(dist, `${__dirname}/${workspace}/dist`);

    return new Funnel(dist, {
      include: ['amd/es5/**'],
      destDir: `${workspace}/dist`,
      annotation: `mv . to ${workspace}/dist`
    });
  })));
}
