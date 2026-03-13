<script lang="ts">
	import { fly } from 'svelte/transition';
	import { X } from '@lucide/svelte';
	import { problems, type Problem } from '$lib/problems';
	import * as m from '$lib/paraglide/messages.js';

	let {
		isOpen = false,
		onClose,
		onSelect
	} = $props<{
		isOpen: boolean;
		onClose: () => void;
		onSelect: (problem: Problem) => void;
	}>();
</script>

{#if isOpen}
	<aside
		class="fixed top-0 bottom-0 left-0 z-50 flex w-96 flex-col border-r bg-background shadow-2xl"
		transition:fly={{ x: -100, duration: 250 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b px-4 py-3">
			<h2 class="text-lg font-semibold tracking-tight">{m.problem_list_title()}</h2>
			<button
				onclick={onClose}
				class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none"
			>
				<X class="h-5 w-5" />
				<span class="sr-only">Close problems</span>
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 space-y-2 overflow-y-auto p-4">
			{#each problems as problem (problem.id)}
				<button
					class="w-full rounded-md border p-4 text-left transition-colors hover:bg-muted/50"
					onclick={() => onSelect(problem)}
				>
					<h3 class="font-medium">
						{(m as unknown as Record<string, () => string>)[problem.title]
							? (m as unknown as Record<string, () => string>)[problem.title]()
							: problem.title}
					</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						{(m as unknown as Record<string, () => string>)[problem.description]
							? (m as unknown as Record<string, () => string>)[problem.description]()
							: problem.description}
					</p>
				</button>
			{/each}
		</div>
	</aside>
{/if}
