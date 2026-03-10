<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import { CodePixEngine } from '$lib/engine/CodePixEngine.js';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';

	let code = $state(`if abs(x) + abs(y) <= 4 then
  return RED
end

return 0`);
	let grid = $state<number[][]>([]);
	let isRunning = $state(false);

	let engine: CodePixEngine | null = null;
	let debounceTimer: ReturnType<typeof setTimeout>;
	let editorError: { line: number; message: string } | null = $state(null);

	onMount(() => {
		engine = new CodePixEngine(16, 16);
		parseAndRun();
		return () => engine?.dispose();
	});

	$effect(() => {
		const currentCode = code;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			parseAndRun();
		}, 500);
	});

	function translateLuaError(msg: string) {
		const m3 = msg.match(/'(.*)' expected \(to close '(.*)' at line (\d+)\) near '(.*)'/);
		if (m3)
			return m.lua_error_expected_closing({
				expected: m3[1],
				token: m3[2],
				line: Math.max(1, parseInt(m3[3], 10) - 2),
				symbol: m3[4]
			});

		const m2 = msg.match(/'(.*)' expected near '(.*)'/);
		if (m2) return m.lua_error_expected({ expected: m2[1], symbol: m2[2] });

		const m1 = msg.match(/unexpected symbol near '(.*)'/);
		if (m1) return m.lua_error_unexpected_symbol({ symbol: m1[1] });

		const m4 = msg.match(/syntax error near '(.*)'/);
		if (m4) return m.lua_error_syntax_near({ symbol: m4[1] });

		return m.lua_error_default({ message: msg });
	}

	async function parseAndRun() {
		if (!engine) return;
		isRunning = true;
		editorError = null;
		try {
			await engine.compile(code);
			grid = await engine.evaluate();
		} catch (error: any) {
			console.error('Execution error:', error);
			const msg = String(error.message || error);
			const match = msg.match(/\[string "..."\]:(\d+):(.*)/);
			if (match) {
				const line = parseInt(match[1], 10) - 2;
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

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<!-- Header -->
	<Header />

	<!-- Main -->
	<main class="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- 左カラム: コードエディタエリア -->
			<Editor bind:code error={editorError} />

			<!-- 右カラム: プレビューエリア -->
			<Preview {grid} {isRunning} />
		</div>
	</main>

	<!-- Footer -->
	<Footer />
</div>
