<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Globe } from '@lucide/svelte';
	import { locales, getLocale, localizeHref } from '$lib/paraglide/runtime.js';

	function toggleLanguage() {
		const nextLocale = getLocale() === 'ja' ? 'en' : 'ja';
		// 注意: APP_BASE_PATH はビルド時に Vite によって注入される絶対パスです。
		const b = APP_BASE_PATH;

		// 1. window.location.pathname からベースパスを剥がす
		let cleanPath = window.location.pathname;
		if (b && cleanPath.startsWith(b)) {
			cleanPath = cleanPath.slice(b.length) || '/';
		}

		// 2. 現在の言語プレフィックスを除去（多重付与を防ぐ）
		const segments = cleanPath.split('/').filter(Boolean);
		if (segments.length > 0 && (locales as string[]).includes(segments[0])) {
			segments.shift();
		}
		const rawPath = '/' + segments.join('/');

		// 3. 新しい言語のパスを生成
		let localizedPath = localizeHref(rawPath as `/${string}`, { locale: nextLocale });

		// 4. ベースパスの付与 (二重付与を防ぐ)
		if (b) {
			const hasBase = localizedPath.startsWith(b + '/') || localizedPath === b;
			if (!hasBase) {
				if (!localizedPath.startsWith('/')) {
					localizedPath = '/' + localizedPath;
				}
				localizedPath = b + localizedPath;
			}
		}

		window.location.href = localizedPath || '/';
	}
</script>

<div class="mx-auto mt-auto w-full max-w-5xl px-4 pb-8">
	<Separator class="my-8" />

	<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
		<div class="flex items-center gap-4">
			<Button
				variant="ghost"
				size="sm"
				class="gap-2 text-muted-foreground"
				onclick={toggleLanguage}
			>
				<Globe class="h-4 w-4" />
				{getLocale() === 'ja' ? 'English' : '日本語'}
			</Button>
		</div>
	</div>
</div>
