<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Globe } from '@lucide/svelte';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';

	function toggleLanguage() {
		const currentLocale = getLocale();
		const nextLocale = currentLocale === 'ja' ? 'en' : 'ja';
		setLocale(nextLocale);
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
