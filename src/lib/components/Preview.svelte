<script lang="ts">
	import { Card } from '$lib/components/ui/card/index.js';
	import { Play } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import { GRID_RADIUS, GRID_SIZE } from '$lib/config';

	const axisLabels = Array.from({ length: GRID_SIZE }, (_, i) => i - GRID_RADIUS);
	const yAxisLabels = [...axisLabels].reverse();

	let { grid = [], isRunning = false } = $props<{
		grid?: number[][];
		isRunning?: boolean;
	}>();
</script>

<div class="flex h-full flex-col space-y-3">
	<div>
		<h2 class="mb-1 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
			{m.preview_title()}
		</h2>
		<div class="flex items-center justify-between"></div>
	</div>

	<Card
		class="relative flex min-h-[400px] flex-1 flex-col items-center justify-center overflow-hidden bg-muted/30 p-6 shadow-inner"
	>
		<div class="relative z-10 grid grid-cols-[auto_320px] grid-rows-[auto_320px]">
			<!-- Empty top-left corner -->
			<div></div>

			<!-- X axis labels (top) -->
			<div class="flex pb-2 font-mono text-xs text-muted-foreground/70">
				{#each axisLabels as label}
					<div class="flex-1 text-center">{label}</div>
				{/each}
			</div>

			<!-- Y axis labels (left) -->
			<div class="flex flex-col pr-2 font-mono text-xs text-muted-foreground/70">
				{#each yAxisLabels as label}
					<div class="flex flex-1 items-center justify-end">{label}</div>
				{/each}
			</div>

			<div class="relative flex h-[320px] w-[320px] items-center justify-center">
				{#if grid.length > 0}
					<div
						class="pointer-events-none z-20 grid h-full w-full"
						style="grid-template-columns: repeat({GRID_SIZE}, 1fr); grid-template-rows: repeat({GRID_SIZE}, 1fr);"
					>
						{#each grid as row, y}
							{#each row as colorIndex, x}
								<div
									style="background-color: {colorIndex === 0
										? 'transparent'
										: `var(--kopiatile-${colorIndex})`};"
									class="flex h-full w-full items-center justify-center transition-all duration-300 select-none {colorIndex ===
									0
										? ''
										: 'z-10 scale-[0.92] rounded-md border border-black/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-3px_4px_rgba(0,0,0,0.3),0_2px_5px_rgba(0,0,0,0.4)]'}"
								></div>
							{/each}
						{/each}
					</div>
				{:else}
					<!-- Dummy visual for empty canvas -->
					<div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
						<Play class="h-8 w-8 text-muted-foreground/20" />
						<span class="text-xs font-medium text-muted-foreground/50">320x320 Canvas Render</span>
					</div>
				{/if}
			</div>
		</div>
	</Card>

	<!-- Status display -->
	<!-- <div class="flex items-center justify-between px-2 pt-2">
		<div class="flex space-x-5">
			<div class="flex items-center gap-2 text-sm font-medium">
				<span class="text-muted-foreground">{m.match_rate_label()}</span>
				<span
					class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs tracking-wider text-foreground"
					>---%</span
				>
			</div>
			<div class="flex items-center gap-2 text-sm font-medium">
				<span class="text-muted-foreground">{m.code_length_label()}</span>
				<span
					class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs tracking-wider text-foreground"
					>---文字</span
				>
			</div>
		</div>
		<div class="flex items-center space-x-2">
			<span class="relative flex h-2.5 w-2.5">
				<span
					class="absolute inline-flex h-full w-full {isRunning
						? 'animate-ping bg-sky-400'
						: 'animate-ping bg-emerald-400'} rounded-full opacity-75"
				></span>
				<span
					class="relative inline-flex h-2.5 w-2.5 rounded-full {isRunning
						? 'bg-sky-500'
						: 'bg-emerald-500'}"
				></span>
			</span>
			<span
				class="text-xs font-semibold tracking-widest uppercase {isRunning
					? 'text-sky-600 dark:text-sky-400'
					: 'text-emerald-600 dark:text-emerald-400'}"
				>{isRunning ? 'Running' : m.status_idle()}</span
			>
		</div>
	</div> -->
</div>
