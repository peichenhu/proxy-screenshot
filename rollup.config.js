/**
 * 作者 chenhu.pei
 */
// import { terser } from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';
// 导出构建配置
export default [
    {
        input: 'src/index.ts',
        external: ['chalk', 'commander', 'node:path', 'node:fs', 'canvas', 'puppeteer'],
        plugins: [
            globals(),
            builtins(),
            resolve(),
            typescript({
                target: 'esnext',
                tsconfig: './tsconfig.json',
            }),
            commonjs({ extensions: ['.js', '.ts'] }),
            // terser(),
        ],
        output: {
            exports: 'named',
            format: 'cjs', // NodeESM 平台规范包
            banner: '#!/usr/bin/env node',
            file: pkg.main,
        },
    },
];
