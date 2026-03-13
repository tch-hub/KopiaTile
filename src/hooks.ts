import { deLocalizeUrl } from '$lib/paraglide/runtime';

// Vite がビルド時に注入する絶対ベースパス
// SvelteKit の $app/paths.base はビルド時に相対パスに変換されるため使用しない
const b = APP_BASE_PATH;

// Vite が要求する場合があるため追加
export const transport = {};

export const reroute = (event) => {
	const url = new URL(event.url);

	// 1. ベースパスを除去した「クリーンなパス」を作成
	let cleanPath = url.pathname;
	if (b && cleanPath.startsWith(b)) {
		cleanPath = cleanPath.slice(b.length) || '/';
	}

	// 2. Paraglide でロケール除去を試行
	const deLocalized = deLocalizeUrl(url);
	let resultPath = deLocalized.pathname;
	if (b && resultPath.startsWith(b)) {
		resultPath = resultPath.slice(b.length) || '/';
	}

	// 3. ロケールが除去された場合（パスが変化した場合）のみ、新しいパスを返す
	// 比較時は末尾のスラッシュを無視して、実質的なパスに変化があるかを確認する
	const normalize = (p: string) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);
	if (normalize(resultPath) !== normalize(cleanPath)) {
		return resultPath;
	}

	return undefined;
};
