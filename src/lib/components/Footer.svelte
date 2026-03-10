<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Play, RotateCcw, Globe } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { setLocale, getLocale } from '$lib/paraglide/runtime.js';

	function toggleLanguage() {
		const current = getLocale();
		setLocale(current === 'ja' ? 'en' : 'ja');
	}
</script>

<div class="mx-auto mt-auto w-full max-w-5xl px-4 pb-8">
	<Separator class="my-8" />

	<!-- Bottom Operations -->
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
