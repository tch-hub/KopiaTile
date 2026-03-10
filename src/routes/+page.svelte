<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import { CodePixEngine } from '$lib/engine/CodePixEngine.js';
	import { onMount } from 'svelte';

	let code = $state('');
	let grid = $state<number[][]>([]);
	let isRunning = $state(false);

	let engine: CodePixEngine | null = null;
	let debounceTimer: ReturnType<typeof setTimeout>;

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

	async function parseAndRun() {
		if (!engine) return;
		isRunning = true;
		try {
			await engine.compile(code);
			grid = await engine.evaluate();
		} catch (error) {
			console.error('Execution error:', error);
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
			<Editor bind:code />

			<!-- 右カラム: プレビューエリア -->
			<Preview {grid} {isRunning} onRun={parseAndRun} />
		</div>
	</main>

	<!-- Footer -->
	<Footer />
</div>
