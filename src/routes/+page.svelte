<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	import ProblemSidebar from '$lib/components/ProblemSidebar.svelte';
	import { type Problem } from '$lib/problems';
	import { FileText, ListTodo, Trophy } from '@lucide/svelte';
	import { KopiaTileEngine } from '$lib/engine/KopiaTileEngine.js';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';

	let code = $state(`if abs(x) + abs(y) <= 4 then
  return RED
end

return 0`);
	let grid = $state<number[][]>([]);
	let isRunning = $state(false);

	let engine: KopiaTileEngine | null = null;
	let debounceTimer: ReturnType<typeof setTimeout>;
	let editorError: { line: number; message: string } | null = $state(null);
	let isDocsOpen = $state(false);

	let selectedProblem: Problem | null = $state(null);
	let targetGrid: number[][] = $state([]);
	let isProblemSidebarOpen = $state(false);
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
		isProblemSidebarOpen = false;
		code = problem.initialCode;
		isSolved = false;
		
		if (engine) {
			try {
				await engine.compile(problem.targetCode);
				targetGrid = await engine.evaluate();
				await parseAndRun(code);
			} catch (e) {
				console.error("Failed to compile target code:", e);
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
<main class="relative mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
	<!-- ヘッダー下部などの配置 -->
	<!-- ヘッダー下部などの配置 -->
	<div class="flex justify-end gap-2">
		<button
			class="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
			onclick={() => (isProblemSidebarOpen = true)}
		>
			<ListTodo class="h-4 w-4" />
			{m.problem_list_title()}
		</button>
		<button
			class="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
			onclick={() => (isDocsOpen = true)}
		>
			<FileText class="h-4 w-4" />
			Documentation
		</button>
	</div>

	{#if selectedProblem}
		<div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6 max-w-3xl flex justify-between items-start animate-in slide-in-from-top-4 fade-in duration-300">
			<div>
				<h2 class="text-2xl font-bold tracking-tight text-primary">{(m as any)[selectedProblem.title] ? (m as any)[selectedProblem.title]() : selectedProblem.title}</h2>
				<p class="text-base text-muted-foreground mt-2 leading-relaxed">{(m as any)[selectedProblem.description] ? (m as any)[selectedProblem.description]() : selectedProblem.description}</p>
			</div>
			<button
				class="shrink-0 ml-4 rounded-md border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
				onclick={() => {
					if (selectedProblem) {
						code = selectedProblem.targetCode;
					}
				}}
			>
				{m.button_show_answer()}
			</button>
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- 左カラム: エディタエリア -->
		<Editor bind:code error={editorError} />

		<!-- 右カラム: プレビューエリア -->
		<div class="flex flex-col gap-6">
			<div class="relative">
				<Preview {grid} {isRunning} {code} error={editorError} />
				{#if selectedProblem && isSolved}
					<div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none">
						<div class="flex items-center gap-3 rounded-full bg-background/95 px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border border-primary/20 animate-in slide-in-from-bottom-4 fade-in duration-300">
							<div class="rounded-full bg-primary/20 p-2 text-primary">
								<Trophy class="h-6 w-6" />
							</div>
							<h3 class="text-xl font-bold tracking-tight text-primary">{m.problem_solved()}</h3>
						</div>
					</div>
				{/if}
			</div>

			{#if selectedProblem}
				<div class="opacity-80">
					<Preview grid={targetGrid} title={m.target_preview_title()} />
				</div>
			{/if}
		</div>
	</div>
</main>

<DocsSidebar isOpen={isDocsOpen} onClose={() => (isDocsOpen = false)} />
<ProblemSidebar isOpen={isProblemSidebarOpen} onClose={() => (isProblemSidebarOpen = false)} onSelect={handleSelectProblem} />
