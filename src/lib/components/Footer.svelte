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
		<div class="flex w-full space-x-3 sm:w-auto">
			<Button
				class="flex-1 gap-2 px-8 font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-primary/30 sm:flex-none"
			>
				<Play class="h-4 w-4" />
				{m.button_run()}
			</Button>
			<Button variant="outline" class="flex-1 gap-2 px-6 sm:flex-none">
				<RotateCcw class="h-4 w-4" />
				{m.button_reset()}
			</Button>
		</div>

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
			<div
				class="flex items-center justify-center rounded-full border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground"
			>
				{m.current_mode_label()} <span class="ml-1.5 font-bold text-foreground">CodePix (Lua)</span>
			</div>
		</div>
	</div>
</div>
