import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			fallback: '404.html'
		}),
		prerender: {
			entries: ['*', '/', '/en'],
			handleHttpError: ({ path, referrer, message }) => {
				// ja がベースになったため /en/ がロケール付きURLになる
				// プリレンダリング時に発生する /en 系の404は許容する
				const ignoredPaths = ['/en', '/en/', '/KopiaTile/en', '/KopiaTile/en/'];
				if (ignoredPaths.some(p => path === p || path.endsWith(p))) {
					console.warn(`[PRERENDER WARNING] Ignored 404 for ${path} (linked from ${referrer})`);
					return;
				}
				console.error(`[PRERENDER ERROR] Path: ${path}, Referrer: ${referrer}, Message: ${message}`);
				throw new Error(message);
			}
		},
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/KopiaTile' : '',
		},
		alias: {
			'@/*': './src/lib/*'
		}
	},
	preprocess: [mdsvex({ extensions: ['.svelte.md', '.md', '.svx'] })],
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
