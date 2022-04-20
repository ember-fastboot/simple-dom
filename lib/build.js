'use strict';
const fs = require('fs');
const path = require('path');
const typescript = require('broccoli-typescript-compiler').default;
const Rollup = require('broccoli-rollup');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const sourcemaps = require('rollup-plugin-sourcemaps');
const buble = require('rollup-plugin-buble');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;
const concat = require('broccoli-concat');
const debugTree = require('broccoli-debug').buildDebugCallback(`simple-dom`);
const FixupSources = require('./fixup-sources');

const rootPath = path.resolve(__dirname, '..');

exports.normalizeWorkspacePath = function normalizeWorkspacePath(workspacePath) {
  let normalized = path.resolve(rootPath, workspacePath);
  normalized = path.relative(rootPath, normalized);
  if (path.sep !== '/') {
    normalized = normalized.replace(/\\/g,'/');
  }
  return normalized;
}

exports.isProduction = isProduction;

function isProduction() {
  return process.env.EMBER_ENV === 'production';
}

function hasTests(workspace) {
  return !isProduction() && fs.existsSync(`${rootPath}/${workspace}/test`);
}

exports.funnelSrc = function funnelSrc(workspace) {
  const srcPath = `${workspace}/src`;
  const src = new Funnel(`${rootPath}/${srcPath}`, {
    // preserve directory structure for tsconfig.json
    destDir: srcPath,
    annotation: srcPath
  });
  if (!hasTests(workspace)) {
    return src;
  }
  const testPath = `${workspace}/test`;
  const test = new Funnel(`${rootPath}/${testPath}`, {
    // preserve directory structure for tsconfig.json
    destDir: testPath,
    annotation: testPath
  });
  return mergeTrees([src, test]);
}

/**
 * Compiles src
 * @param {BroccoliTree} src [workspace]/src/*.ts
 * @param {any} compilerOptions
 * @returns {BroccoliTree} [workspace]
 *                          ├── dist
 *                          │   ├── src/*.{js,map}
 *                          │   ├── types/*.d.ts
 *                          │   └── test/*.{js,d.ts,map}
 *                          ├── src/*.ts
 *                          └── test/*.ts
 */
exports.compileSrc = function compileSrc(src, compilerOptions) {
  const compiled = debugTree(typescript(src, {
    workingPath: rootPath,
    buildPath: 'dist',
    annotation: 'build ts',
    compilerOptions: compilerOptions
  }), 'typescript-output');

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
      return relativePath
        .replace('/src/', relativePath.endsWith('.d.ts') ? '/dist/types/' : '/dist/src/')
        .replace('/test/', '/dist/test/')
    },
    annotation: 'move compiled ts output to dist',
  });

  // merge so rollup can find sources for sourcemaps.
  return debugTree(mergeTrees([dist, src], {
    annotation: 'merge back sources for rollup sourcemaps',
  }), 'compiled-output');
}

/**
 * Package compiled output
 * @param {BroccoliTree} compiled output of compileSrc
 * @param {string} workspace normalized workspace path
 * @returns {BroccoliTree} [workspace]/dist
 *                          ├── amd/es5
 *                          │   ├── index.js
 *                          │   └── index.js.map
 *                          ├── commonjs/es5
 *                          │   ├── index.js
 *                          │   └── index.js.map
 *                          ├── modules/es2017
 *                          │   ├── index.js
 *                          │   └── index.js.map
 *                          ├── types/*.d.ts
 *                          ├── test/amd
 *                          │   ├── index.js
 *                          │   └── index.js.map
 *                          └── test/commonjs
 *                              ├── index.js
 *                              └── index.js.map
 *
 */
exports.packageDist = function packageDist(compiled, workspace, addTestVendor) {
  const rollup = rollupPackage(compiled, workspace);

  const distPath = `${workspace}/dist`;

  const dist = new Funnel(rollup, {
    getDestinationPath(relativePath) {
      return relativePath.slice(distPath.length + 1);
    },
    annotation: `mv ${distPath} to .`,
  });

  if (isProduction() || addTestVendor !== true) {
    return debugTree(dist, `packageDist/${workspace}/output`);
  }

  let vendor = new Funnel(new UnwatchedDir(rootPath), {
    include: [`packages/@simple-dom/*/dist/amd/es5/index.*`],
    exclude: [`${workspace}/**`, `**/node_modules/**`, `**/tmp/**`]
  });

  vendor = mergeTrees([vendor, rollup]);

  // place vendored package sources at root
  vendor = new FixupSources(vendor, '../..');

  vendor = debugTree(vendor, `packageDist/${workspace}/test-vendor-before-concat`);

  vendor = concat(vendor, {
    outputFile: '/test/amd/vendor.js',
    inputFiles: ['packages/**/dist/amd/es5/index.js'],
    sourceMapConfig: { enabled: true }
  });

  return debugTree(
    mergeTrees([testDist(), dist, vendor]),
    `packageDist/${workspace}/output`);
}

exports.testDist = testDist;

function testDist() {
  const qunit = new Funnel(path.dirname(require.resolve('qunit')), {
    include: ['qunit.js', 'qunit.css'],
    destDir: 'test'
  });

  const tokenizer = new Funnel(path.dirname(require.resolve('simple-html-tokenizer')), {
    include: ['simple-html-tokenizer.*'],
    destDir: 'test'
  });

  const loader = new Funnel(path.dirname(require.resolve('loader.js')), {
    include: ['loader.js'],
    destDir: 'test'
  });

  const index = new Funnel(`${rootPath}/test`, { destDir: 'test' });

  return debugTree(
    mergeTrees([qunit, tokenizer, loader, index]),
    'testDist');
}

function rollupPackage(allDist, workspace) {
  allDist = debugTree(
    allDist,
    `rollupPackage/${workspace}/input`);
  const packageName = workspace.replace('packages/', '');
  const packageJSON = JSON.parse(fs.readFileSync(
    `${rootPath}/${workspace}/package.json`, 'utf8'));
  const external = [];
  if (packageJSON.dependencies) {
    external.push(...Object.keys(packageJSON.dependencies));
  }
  // only used by test helper just to avoid cycles with document
  if (packageJSON.peerDependencies) {
    external.push(...Object.keys(packageJSON.peerDependencies));
  }
  const rollupES20017 = new Rollup(allDist, {
    annotation: `rollup ${workspace}/dist/src/index.js ES2017`,
    rollup: {
      input: `${workspace}/dist/src/index.js`,
      external: external,
      plugins: [
        sourcemaps(),
      ],
      output: [{
        file: `${workspace}/dist/modules/es2017/index.js`,
        format: 'es',
        sourcemap: true,
      }],
    },
  });
  const rollupES5 = new Rollup(allDist, {
    annotation: `rollup ${workspace}/dist/src/index.js ES5`,
    rollup: {
      input: `${workspace}/dist/src/index.js`,
      external: external,
      plugins: [
        sourcemaps(),
        buble(),
      ],
      output: [{
        amd: { id: packageName },
        file: `${workspace}/dist/amd/es5/index.js`,
        format: 'amd',
        sourcemap: true,
      }, {
        file: `${workspace}/dist/commonjs/es5/index.js`,
        format: 'cjs',
        sourcemap: true,
      }],
    },
  });
  const types = new Funnel(allDist, {
    include: [`${workspace}/dist/types/**/*.d.ts`],
    annotation: `${workspace}/dist/types`,
  });
  const trees = [
    debugTree(
      rollupES20017,
      `rollupPackage/${workspace}/es2015`),
    debugTree(
      rollupES5,
      `rollupPackage/${workspace}/es5`),
    debugTree(
      types,
      `rollupPackage/${workspace}/types`)];
  if (hasTests(workspace)) {
    let testExternal = [packageName].concat(external);
    if (packageJSON.devDependencies) {
      testExternal.push(...Object.keys(packageJSON.devDependencies));
    }
    let test = debugTree(
      new Rollup(allDist, {
        annotation: `rollup ${workspace}/dist/test/index.js ES5`,
        rollup: {
          input: `${workspace}/dist/test/index.js`,
          external: testExternal,
          plugins: [
            sourcemaps(),
            buble(),
          ],
          output: [{
            amd: { id: `${packageName}/test` },
            file: `${workspace}/dist/test/amd/index.js`,
            format: 'amd',
            sourcemap: true,
          }, {
            file: `${workspace}/dist/test/commonjs/index.js`,
            format: 'cjs',
            sourcemap: true,
          }]
        },
      }),
      `rollupPackage/${workspace}/test`);
    trees.push(test);
  }
  return debugTree(mergeTrees(trees, {
    annotation: `${workspace}/dist`,
  }), `rollupPackage/${workspace}/output`);
}
