<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	import ProblemSidebar from '$lib/components/ProblemSidebar.svelte';
	import ProblemDescription from '$lib/components/ProblemDescription.svelte';
	import { type Problem } from '$lib/problems';
	import { Trophy } from '@lucide/svelte';
	import { KopiaTileEngine } from '$lib/engine/KopiaTileEngine.js';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { uiState } from '$lib/states.svelte';

	let code = $state(`if abs(x) + abs(y) <= 4 then
  return RED
end

return 0`);
	let grid = $state<number[][]>([]);
	let isRunning = $state(false);

	let engine: KopiaTileEngine | null = null;
	let debounceTimer: ReturnType<typeof setTimeout>;
	let editorError: { line: number; message: string } | null = $state(null);
	let selectedProblem: Problem | null = $state(null);
	let targetGrid: number[][] = $state([]);
	let isSolved = $state(false);

	function checkGridsMatch(g1: number[][], g2: number[][]) {
		if (!g1 || !g2 || g1.length !== g2.length) return false;
		for (let y = 0; y < g1.length; y++) {
			if (g1[y].length !== g2[y].length) return false;
			for (let x = 0; x < g1[y].length; x++) {
				if (g1[y][x] !== g2[y][x]) return false;
			}
		}
		return true;
	}

	async function handleSelectProblem(problem: Problem) {
		selectedProblem = problem;
		uiState.isProblemSidebarOpen = false;
		code = problem.initialCode;
		isSolved = false;

		if (engine) {
			try {
				await engine.compile(problem.targetCode);
				targetGrid = await engine.evaluate();
				await parseAndRun(code);
			} catch (e) {
				console.error('Failed to compile target code:', e);
			}
		}
	}

	onMount(() => {
		engine = new KopiaTileEngine(16, 16);
		parseAndRun();
		return () => engine?.dispose();
	});

	$effect(() => {
		const _code = code; // codeの変更をSvelte 5のリアクティビティに追跡させる
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			parseAndRun(_code);
		}, 500);
	});

	function translateLuaError(msg: string) {
		const m3 = msg.match(/'(.*)' expected \(to close '(.*)' at line (\d+)\) near '(.*)'/);
		if (m3)
			return m.lua_error_expected_closing({
				expected: m3[1],
				token: m3[2],
				line: Math.max(1, parseInt(m3[3], 10) - 9),
				symbol: m3[4]
			});

		const m2 = msg.match(/'(.*)' expected near '(.*)'/);
		if (m2) return m.lua_error_expected({ expected: m2[1], symbol: m2[2] });

		const m5 = msg.match(/<name> expected near '(.*)'/);
		if (m5) return m.lua_error_name_expected({ symbol: m5[1] });

		const m1 = msg.match(/unexpected symbol near '(.*)'/);
		if (m1) return m.lua_error_unexpected_symbol({ symbol: m1[1] });

		const m4 = msg.match(/syntax error near '(.*)'/);
		if (m4) return m.lua_error_syntax_near({ symbol: m4[1] });

		return m.lua_error_default({ message: msg });
	}

	async function parseAndRun(currentCode: string = code) {
		if (!engine) return;
		isRunning = true;
		editorError = null;

		// 最小表示時間を確保するためのタイマー
		const minWait = new Promise((resolve) => setTimeout(resolve, 400));

		try {
			await engine.compile(currentCode);
			grid = await engine.evaluate();

			if (selectedProblem && targetGrid.length > 0) {
				isSolved = checkGridsMatch(grid, targetGrid);
			} else {
				isSolved = false;
			}

			// コンパイルと評価が終わった後、最小待機時間が経過するまで待つ
			await minWait;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error('Execution error:', errorMessage);
			const msg = String(errorMessage);
			const match = msg.match(/\[string "..."\]:(\d+):(.*)/);
			if (match) {
				const line = parseInt(match[1], 10) - 9;
				const pureMsg = match[2].trim();
				editorError = { line: Math.max(1, line), message: translateLuaError(pureMsg) };
			} else {
				editorError = { line: 1, message: msg };
			}
		} finally {
			isRunning = false;
		}
	}
</script>

<!-- Main -->
<main class="relative mx-auto w-full max-w-[1400px] flex-1 space-y-4 px-4 py-4">
	<ProblemDescription bind:selectedProblem {isSolved} bind:code bind:targetGrid />

	<div class="grid grid-cols-1 gap-6 {selectedProblem ? 'md:grid-cols-3' : 'md:grid-cols-2'}">
		<!-- 左カラム: エディタエリア -->
		<Editor bind:code error={editorError} />

		<!-- 中央カラム: プレビューエリア -->
		<div class="group relative">
			<Preview {grid} {isRunning} {code} error={editorError} {isSolved} />
			{#if selectedProblem && isSolved}
				<div
					class="pointer-events-none absolute top-3 right-3 z-40 flex items-center justify-center"
				>
					<div
						class="flex animate-in items-center gap-2 rounded-lg border border-primary-foreground/20 bg-primary px-3 py-1.5 shadow-lg duration-500 fade-in slide-in-from-top-2"
					>
						<Trophy class="h-4 w-4 text-primary-foreground" />
						<span class="text-sm font-bold tracking-tight text-primary-foreground"
							>{m.problem_solved()}</span
						>
					</div>
				</div>
			{/if}
		</div>

		<!-- 右カラム: ターゲットプレビュー（問題選択時のみ） -->
		{#if selectedProblem}
			<div class="opacity-80">
				<Preview grid={targetGrid} title={m.target_preview_title()} />
			</div>
		{/if}
	</div>
</main>

<DocsSidebar isOpen={uiState.isDocsOpen} onClose={() => (uiState.isDocsOpen = false)} />
<ProblemSidebar
	isOpen={uiState.isProblemSidebarOpen}
	onClose={() => (uiState.isProblemSidebarOpen = false)}
	onSelect={handleSelectProblem}
/>
