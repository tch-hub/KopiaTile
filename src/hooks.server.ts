import type { Handle } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) => {
	// Paraglideに言語を判定させるため、ベースパスを除去したURLを渡す
	const urlForParaglide = new URL(event.request.url);
	if (base && urlForParaglide.pathname.startsWith(base)) {
		urlForParaglide.pathname = urlForParaglide.pathname.slice(base.length) || '/';
	}
	const modifiedRequest = new Request(urlForParaglide, event.request);

	return paraglideMiddleware(modifiedRequest, async ({ locale }) => {
		// 【重要】ここで event.request を上書きしてはいけません！
		// SvelteKit のルーティング自体は hooks.ts の reroute フックで処理されるため、
		// 元の event をそのまま resolve に渡すのが正解です。

		const response = await resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});

		// リダイレクト時の Location ヘッダーにベースパスが欠けていれば補完する
		if (response.status >= 300 && response.status < 400) {
			const location = response.headers.get('Location');
			if (location && location.startsWith('/') && !location.startsWith(base)) {
				const newResponse = new Response(response.body, response);
				newResponse.headers.set('Location', base + location);
				return newResponse;
			}
		}

		return response;
	});
};

export const handle: Handle = handleParaglide;
