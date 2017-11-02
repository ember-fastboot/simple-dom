const fs = require('fs');
const path = require('path');
const typescript = require('broccoli-typescript-compiler').typescript;
const Rollup = require('broccoli-rollup');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const tee = require('broccoli-tee');
const sourcemaps = require('rollup-plugin-sourcemaps');
const buble = require('rollup-plugin-buble');

module.exports = function (opts) {
  // array of ['packages/@simple-dom/document', ...];
  const workspaces = getWorkspaces();

  // tree of
  // [workspace]/src/**/*.ts
  const srcs = getWorkspaceSrcs(workspaces);

  // compile returns tree of
  // [workspace]
  //  ├── dist
  //  │   ├── src/**/*.js
  //  │   └── types/**/*.d.ts
  //  └── src/**/*.ts
  const allDist = compile(srcs);

  // Tees individual package dists:
  // [workspace]/dist
  //  ├── amd/es5
  //  │   ├── index.js
  //  │   └── index.js.map
  //  ├── commonjs
  //  │   ├── es2017
  //  │   │   ├── index.js
  //  │   │   └── index.js.map
  //  │   └── es5
  //  │       ├── index.js
  //  │       └── index.js.map
  //  ├── modules
  //  │   ├── es2017
  //  │   │   ├── index.js
  //  │   │   └── index.js.map
  //  │   └── es5
  //  │       ├── index.js
  //  │       └── index.js.map
  //  └── types/**/*.d.ts
  //
  // And returns tree of AMD for toplevel test for use in browser tests
  // [workspace]/dist/amd/es5
  //  ├── index.js
  //  └── index.js.map
  return packageDists(workspaces, allDist);
}

function getWorkspaces() {
  // only build workspaces that have a src dir
  return require('./package').workspaces.filter((workspace) => {
    return fs.existsSync(`${__dirname}/${workspace}/src`);
  });
}

function getWorkspaceSrcs(workspaces) {
  // funnel src dirs from workspaces
  const srcs = workspaces.map((workspace) => {
    const srcPath = `${workspace}/src`;
    return new Funnel(`${__dirname}/${srcPath}`, {
      // preserve directory structure for tsconfig.json
      destDir: srcPath,
      annotation: srcPath
    });
  });
  // merge workspaces for compile
  return mergeTrees(srcs, {
    annotation: 'merge workspaces srcs',
  });
}

function compile(srcs) {
  const compiled = typescript(srcs, {
    rootPath: __dirname,
    buildPath: 'dist',
    annotation: 'build ts'
  });

  // typescript outputs sourcemaps relative to
  // dist/packages/@simple-dom/parser/src/index.js
  //   ../      ../         ../    ../ ../packages/@simple-dom/parser/src/index.ts
  // we need to keep the same levels
  // packages/@simple-dom/parser/dist/src/index.js
  // so that when we merge ts back into the tree
  // rollup-plugin-sourcemaps can find them
  // packages/@simple-dom/parser/src/index.ts
  const dist = new Funnel(compiled, {
    getDestinationPath(relativePath) {
      return relativePath.replace('/src/',
        relativePath.endsWith('.d.ts') ? '/dist/types/' : '/dist/src/');
    },
    annotation: 'move compiled ts output to dist',
  });

  // merge back in sources for sourcemaps.
  return mergeTrees([dist, srcs], {
    annotation: 'merge back sources for rollup sourcemaps',
  });
}

function packageDists(workspaces, allDist) {
  return mergeTrees(workspaces.map(packageDist.bind(null, allDist)));
}

function packageDist(allDist, workspace) {
  const rollup = rollupPackage(allDist, workspace);

  const distPath = `${workspace}/dist`;

  const dist = new Funnel(rollup, {
    getDestinationPath(relativePath) {
      return relativePath.slice(distPath.length + 1);
    },
    annotation: `mv ${distPath} to .`,
  });

  tee(dist, `${__dirname}/${distPath}`);

  return new Funnel(dist, {
    include: ['amd/es5/**'],
    destDir: distPath,
    annotation: `mv . to ${distPath}`
  });
}

function rollupPackage(allDist, workspace) {
  const packageName = workspace.replace('packages/', '');
  const external = ['@simple-dom/document',
                    '@simple-dom/parser',
                    '@simple-dom/serializer',
                    '@simple-dom/void-map'];
  const rollupES20017 = new Rollup(allDist, {
    annotation: `rollup ${workspace}/dist/src/index.js ES2017`,
    rollup: {
      entry: `${workspace}/dist/src/index.js`,
      external: external,
      plugins: [
        sourcemaps(),
      ],
      targets: [{
        dest: `${workspace}/dist/commonjs/es2017/index.js`,
        format: 'cjs',
      }, {
        dest: `${workspace}/dist/modules/es2017/index.js`,
        format: 'es',
      }],
      sourceMap: true,
    },
  });
  const rollupES5 = new Rollup(allDist, {
    annotation: `rollup ${workspace}/dist/src/index.js ES5`,
    rollup: {
      entry: `${workspace}/dist/src/index.js`,
      external: external,
      plugins: [
        sourcemaps(),
        buble(),
      ],
      targets: [{
        moduleId: packageName,
        dest: `${workspace}/dist/amd/es5/index.js`,
        format: 'amd',
      }, {
        dest: `${workspace}/dist/commonjs/es5/index.js`,
        format: 'cjs',
      }, {
        dest: `${workspace}/dist/modules/es5/index.js`,
        format: 'es',
      }],
      sourceMap: true,
    },
  });
  const types = new Funnel(allDist, {
    include: [`${workspace}/dist/types/**/*.d.ts`],
    annotation: `${workspace}/dist/types`,
  });
  return mergeTrees([rollupES20017, rollupES5, types], {
    annotation: `${workspace}/dist`,
  });
}
