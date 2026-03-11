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
		class="fixed top-0 left-0 bottom-0 z-50 flex w-96 flex-col border-r bg-background shadow-2xl"
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
		<div class="flex-1 overflow-y-auto p-4 space-y-2">
			{#each problems as problem (problem.id)}
				<button
					class="w-full text-left rounded-md border p-4 hover:bg-muted/50 transition-colors"
					onclick={() => onSelect(problem)}
				>
					<h3 class="font-medium">{(m as any)[problem.title] ? (m as any)[problem.title]() : problem.title}</h3>
					<p class="text-sm text-muted-foreground mt-1">{(m as any)[problem.description] ? (m as any)[problem.description]() : problem.description}</p>
				</button>
			{/each}
		</div>
	</aside>
{/if}
