<script lang="ts">
	import { type Problem } from '$lib/problems';
	import { Trophy, X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		selectedProblem = $bindable(),
		isSolved,
		code = $bindable(),
		targetGrid = $bindable()
	}: {
		selectedProblem: Problem | null;
		isSolved: boolean;
		code: string;
		targetGrid: number[][];
	} = $props();
</script>

{#if selectedProblem}
	<div
		class="flex animate-in items-center justify-between rounded-xl border bg-card p-4 text-card-foreground shadow-sm duration-300 fade-in slide-in-from-top-4"
	>
		<div class="flex flex-col gap-0.5">
			<div class="flex items-center gap-2">
				<h2 class="text-xl font-bold tracking-tight text-primary">
					{(m as unknown as Record<string, () => string>)[selectedProblem.title]
						? (m as unknown as Record<string, () => string>)[selectedProblem.title]()
						: selectedProblem.title}
				</h2>
				{#if isSolved}
					<div
						class="flex animate-in items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary duration-300 zoom-in"
					>
						<Trophy class="h-3 w-3" />
						SOLVED
					</div>
				{/if}
			</div>
			<p class="text-sm leading-relaxed text-muted-foreground">
				{(m as unknown as Record<string, () => string>)[selectedProblem.description]
					? (m as unknown as Record<string, () => string>)[selectedProblem.description]()
					: selectedProblem.description}
			</p>
		</div>
		<div class="ml-4 flex shrink-0 items-center gap-2">
			<button
				class="inline-flex h-9 items-center justify-center rounded-md border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
				onclick={() => {
					if (selectedProblem) {
						code = selectedProblem.targetCode;
					}
				}}
			>
				{m.button_show_answer()}
			</button>
			<button
				class="inline-flex h-9 items-center justify-center rounded-md border border-muted-foreground/20 bg-muted/10 px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/20"
				title={m.button_close_problem()}
				onclick={() => {
					selectedProblem = null;
					targetGrid = [];
					// 親コンポーネントで isSolved も false にリセットされる必要があるが、
					// ここで selectedProblem = null にすることで displaysCondition を切り離す
				}}
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	</div>
{/if}
