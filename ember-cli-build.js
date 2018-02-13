'use strict';
const fs = require('fs');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const tee = require('broccoli-tee');
const concat = require('broccoli-concat');
const build = require('./lib/build');
const FixupSources = require('./lib/fixup-sources');

module.exports = function () {
  const workspaces = require('./package').workspaces.filter((workspace) => {
    return fs.existsSync(`${__dirname}/${workspace}/src`);
  });

  const src = mergeTrees(workspaces.map(build.funnelSrc), {
    annotation: 'merge workspace src',
  });

  const compiled = build.compileSrc(src);

  let dist = new FixupSources(mergeTrees(workspaces.map((workspace) => {
    const dist = build.packageDist(compiled, workspace);

    tee(dist, `${__dirname}/${workspace}/dist`);

    return new Funnel(dist, {
      include: ['amd/es5/**', 'test/**'],
      destDir: `${workspace}/dist`,
      annotation: `mv . to ${workspace}/dist`
    });
  })), '..');

  const vendor = concat(dist, {
    outputFile: '/test/amd/vendor.js',
    inputFiles: ['packages/**/dist/amd/es5/index.js'],
    sourceMapConfig: { enabled: true }
  });

  const test = concat(dist, {
    outputFile: '/test/amd/index.js',
    inputFiles: ['packages/**/test/amd/index.js'],
    sourceMapConfig: { enabled: true }
  });

  return mergeTrees([vendor, test, build.testDist()]);
}
