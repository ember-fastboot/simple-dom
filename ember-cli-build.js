'use strict';
const fs = require('fs');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const tee = require('broccoli-tee');
const build = require('./lib/build');

module.exports = function (opts) {
  const workspaces = require('./package').workspaces.filter((workspace) => {
    return fs.existsSync(`${__dirname}/${workspace}/src`);
  });

  const src = mergeTrees(workspaces.map(build.funnelSrc), {
    annotation: 'merge workspace src',
  });

  const compiled = build.compileSrc(src);

  return mergeTrees(workspaces.map((workspace) => {
    const dist = build.packageDist(compiled, workspace);

    tee(dist, `${__dirname}/${workspace}/dist`);

    return new Funnel(dist, {
      include: ['amd/es5/**'],
      destDir: `${workspace}/dist`,
      annotation: `mv . to ${workspace}/dist`
    });
  }));
}
