import { defineConfig } from 'vite'
import topLevelAwait from "vite-plugin-top-level-await";
import webfontDownload from 'vite-plugin-webfont-dl';
import urlResolve from 'rollup-plugin-url-resolve';
import terser from '@rollup/plugin-terser';
import { exec } from 'child_process';


// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
	build: {
		lib: {
			entry: 'index.html',
      // entry: 'src/main.js',
      formats: ['es'],
    },
		rollupOptions: {
			plugins: [
				terser(),
				urlResolve({
					cacheManager: '.cache',
					minify: true,
				})
			]
		},
	},
	plugins: [
		topLevelAwait({
			promiseExportName: "__tla",
			promiseImportName: i => `__tla_${i}`
		}),
		webfontDownload(),
	],
	server: {
		headers: {
		"Cache-Control": "no-cache; max-age=1",
    "Cross-Origin-Embedder-Policy": "require-corp",
		"Cross-Origin-Opener-Policy": "same-origin",
		"Cross-Origin-Resource-Policy": "cross-origin",
		}
	}
})
