<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	const status = $derived(page.status);
	const error = $derived(page.error);

	const is404 = $derived(status === 404);
	const title = $derived(is404 ? m.error_page_title_404() : m.error_page_title_generic());
	const message = $derived(is404 ? m.error_page_message_404() : m.error_page_message_generic());

	function getHomeHref() {
		const b = APP_BASE_PATH;
		let p = localizeHref('/');

		// 1. 生成されたパスが既にベースパスを含んでいるか確認
		const hasBase = b && (p.startsWith(b + '/') || p === b);
		if (!hasBase && b) {
			if (!p.startsWith('/')) p = '/' + p;
			p = b + p;
		}

		return p || '/';
	}
</script>

<svelte:head>
	<title>{status} - {title}</title>
</svelte:head>

<main class="flex flex-1 flex-col items-center justify-center p-4 text-center">
	<div class="relative mb-8">
		<div
			class="absolute -inset-4 rotate-3 transform rounded-xl bg-destructive/10 blur-xl dark:bg-destructive/20"
		></div>
		<div
			class="relative flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-destructive bg-card shadow-2xl"
		>
			<span class="text-6xl font-bold text-destructive">
				{status}
			</span>
		</div>
	</div>

	<h1 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
		{title}
	</h1>

	<p class="mb-8 max-w-md text-muted-foreground">
		{message}
		{#if !is404 && error?.message}
			<br />
			<span class="mt-2 block font-mono text-xs opacity-70">
				Details: {error.message}
			</span>
		{/if}
	</p>

	<div class="flex flex-col gap-4 sm:flex-row">
		<a
			href={getHomeHref()}
			class="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		>
			{m.error_page_back_home()}
		</a>
	</div>
</main>

<style>
	main {
		background-image: radial-gradient(circle at 2px 2px, var(--border) 1px, transparent 0);
		background-size: 24px 24px;
	}
</style>
