import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/links.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [typescript({ include: './src/**/*.ts' })],
    external: ['morphdom'],
  },
  {
    input: 'src/links.ts',
    output: {
      file: 'dist/links.esm.js',
      format: 'esm',
    },
    plugins: [typescript({ include: './src/**/*.ts', sourceMap: false })],
    external: ['morphdom'],
  },
  {
    input: 'src/standalone.ts',
    output: {
      file: 'dist/links.standalone.min.js',
      format: 'iife',
      sourcemap: false,
    },
    plugins: [
      typescript({ include: './src/**/*.ts', declaration: false, sourceMap: false, target: 'es5' }),
      terser({ output: { comments: false } }),
      nodeResolve(),
    ],
  },
];
