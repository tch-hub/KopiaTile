<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();

	function getLocalizedPath(locale: (typeof locales)[number]) {
		const rawPath = page.url.pathname;
		// 注意: APP_BASE_PATH はビルド時に Vite によって注入される絶対パスです。
		// SvelteKit の base パスはビルド時に相対パスになるため使用しないでください。
		const b = APP_BASE_PATH;

		// 1. パスからベースパスを剥がす
		let cleanPath = rawPath;
		if (b && cleanPath.startsWith(b)) {
			cleanPath = cleanPath.slice(b.length) || '/';
		}

		// 2. Paraglide に渡して新しい言語のパスを生成
		let localizedPath = localizeHref(cleanPath as `/${string}`, { locale });

		// 3. 生成されたパスにベースパスを付与 (二重付与を防ぐ)
		if (b) {
			const hasBase = localizedPath.startsWith(b + '/') || localizedPath === b;
			if (!hasBase) {
				if (!localizedPath.startsWith('/')) {
					localizedPath = '/' + localizedPath;
				}
				localizedPath = b + localizedPath;
			}
		}

		return localizedPath || '/';
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<Header />
	{@render children()}
	<Footer />
</div>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={getLocalizedPath(locale)}>{locale}</a>
	{/each}
</div>
