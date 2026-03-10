<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	import { FileText } from '@lucide/svelte';
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
	<div class="flex justify-end">
		<button
			class="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
			onclick={() => (isDocsOpen = true)}
		>
			<FileText class="h-4 w-4" />
			Documentation
		</button>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- 左カラム: コードエディタエリア -->
		<Editor bind:code error={editorError} />

		<!-- 右カラム: プレビューエリア -->
		<Preview {grid} {isRunning} {code} error={editorError} />
	</div>
</main>

<DocsSidebar isOpen={isDocsOpen} onClose={() => (isDocsOpen = false)} />
