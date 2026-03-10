<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Sun, Moon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';

	let isDarkMode = $state(false);

	onMount(() => {
		// 初期状態として現在のHTMLクラスを確認
		if (typeof document !== 'undefined') {
			isDarkMode = document.documentElement.classList.contains('dark');
		}
	});

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		if (typeof document !== 'undefined') {
			if (isDarkMode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}
</script>

<header
	class="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="flex items-center gap-2 text-xl font-bold tracking-tight">
		<div
			class="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground"
		>
			CP
		</div>
		CodePix
	</div>
	<Button variant="ghost" size="icon" onclick={toggleTheme}>
		{#if isDarkMode}
			<Moon class="h-5 w-5 text-muted-foreground" />
		{:else}
			<Sun class="h-5 w-5 text-muted-foreground" />
		{/if}
		<span class="sr-only">Toggle theme</span>
	</Button>
</header>
