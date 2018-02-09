'use strict';
const fs = require('fs');
const path = require('path');
const typescript = require('broccoli-typescript-compiler').typescript;
const Rollup = require('broccoli-rollup');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const sourcemaps = require('rollup-plugin-sourcemaps');
const buble = require('rollup-plugin-buble');
const debugTree = require('broccoli-debug').buildDebugCallback(`simple-dom`);

const rootPath = path.resolve(__dirname, '..');

exports.normalizeWorkspacePath = function normalizeWorkspacePath(workspacePath) {
  let normalized = path.resolve(rootPath, workspacePath);
  normalized = path.relative(rootPath, normalized);
  if (path.sep !== '/') {
    normalized = normalized.replace(/\\/g,'/');
  }
  return normalized;
}

function hasTests(workspace) {
  return fs.existsSync(`${workspace}/test`);
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
 *                          │   ├── src/*.js
 *                          │   └── types/*.d.ts
 *                          └── src/*.ts
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
 *                          ├── commonjs
 *                          │   ├── es2017
 *                          │   │   ├── index.js
 *                          │   │   └── index.js.map
 *                          │   └── es5
 *                          │       ├── index.js
 *                          │       └── index.js.map
 *                          ├── modules
 *                          │   ├── es2017
 *                          │   │   ├── index.js
 *                          │   │   └── index.js.map
 *                          │   └── es5
 *                          │       ├── index.js
 *                          │       └── index.js.map
 *                          └── types/*.d.ts
 */
exports.packageDist = function packageDist(compiled, workspace) {
  const rollup = rollupPackage(compiled, workspace);

  const distPath = `${workspace}/dist`;

  return new Funnel(rollup, {
    getDestinationPath(relativePath) {
      return relativePath.slice(distPath.length + 1);
    },
    annotation: `mv ${distPath} to .`,
  });
}

function rollupPackage(allDist, workspace) {
  allDist = debugTree(allDist, 'rollup-input');
  const packageName = workspace.replace('packages/', '');
  const packageJSON = JSON.parse(fs.readFileSync(
    `${rootPath}/${workspace}/package.json`, 'utf8'));
  const external = [];
  if (packageJSON.dependencies) {
    external.push(...Object.keys(packageJSON.dependencies));
  }
  const rollupES20017 = debugTree(new Rollup(allDist, {
    annotation: `rollup ${workspace}/dist/src/index.js ES2017`,
    rollup: {
      input: `${workspace}/dist/src/index.js`,
      external: external,
      plugins: [
        sourcemaps(),
      ],
      output: [{
        file: `${workspace}/dist/commonjs/es2017/index.js`,
        format: 'cjs',
        sourcemap: true,
      }, {
        file: `${workspace}/dist/modules/es2017/index.js`,
        format: 'es',
        sourcemap: true,
      }],
    },
  }), `rollupES20017/${workspace}` );
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
      }, {
        file: `${workspace}/dist/modules/es5/index.js`,
        format: 'es',
        sourcemap: true,
      }],
    },
  });
  const types = new Funnel(allDist, {
    include: [`${workspace}/dist/types/**/*.d.ts`],
    annotation: `${workspace}/dist/types`,
  });
  const trees = [rollupES20017, rollupES5, types];
  if (hasTests(workspace)) {
    trees.push(new Rollup(allDist, {
      annotation: `rollup ${workspace}/dist/test/index.js ES5`,
      rollup: {
        input: `${workspace}/dist/test/index.js`,
        external: ['simple-html-tokenizer'].concat(external),
        plugins: [
          sourcemaps(),
          buble(),
        ],
        output: [{
          amd: { id: packageName },
          file: `${workspace}/dist/amd/es5/test.js`,
          format: 'amd',
          sourcemap: true,
        }, {
          file: `${workspace}/dist/commonjs/es5/test.js`,
          format: 'cjs',
          sourcemap: true,
        }]
      },
    }));
  }
  return mergeTrees(trees, {
    annotation: `${workspace}/dist`,
  });
}
