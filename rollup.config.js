/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

const extensions = ['.ts', '.tsx', '.js', '.jsx'];

export default defineConfig({
  input: 'src/index.ts',
  output: [{ file: 'dist/index.js', format: 'es', sourcemap: true }],

  plugins: [
    json(),
    commonjs({
      include: 'node_modules/**',
    }),
    resolve({
      extensions,
    }),
    babel({
      extensions,
      babelHelpers: 'bundled',
    }),
  ],
  external: [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ],
});
