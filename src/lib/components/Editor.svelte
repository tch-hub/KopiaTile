<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type * as Monaco from 'monaco-editor';

	let {
		code = $bindable(
			'-- Write your CodePix Lua script here\n\nif y == 1 then\n  return 2\nend\nreturn 1\n'
		)
	} = $props();

	let editorContainer: HTMLDivElement | null = $state(null);
	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof Monaco | null = null;

	onMount(async () => {
		monaco = await import('monaco-editor');
		const editorWorker = await import('monaco-editor/esm/vs/editor/editor.worker?worker');

		(self as any).MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				return new editorWorker.default();
			}
		};

		if (editorContainer && monaco) {
			editor = monaco.editor.create(editorContainer, {
				value: code,
				language: 'lua',
				theme: 'vs-dark',
				automaticLayout: true,
				minimap: { enabled: false },
				fontSize: 14,
				fontFamily: 'Consolas, "Courier New", monospace',
				lineHeight: 21,
				padding: { top: 16 }
			});

			editor.onDidChangeModelContent(() => {
				code = editor?.getValue() || '';
			});
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.dispose();
		}
	});
</script>

<div class="flex flex-col space-y-3">
	<div class="flex items-center justify-between">
		<h2 class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
			{m.code_editor_title()}
		</h2>
		<span
			class="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
		>
			{m.problem_tag()}
		</span>
	</div>

	<div
		class="relative flex h-[400px] w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm"
	>
		<!-- Editor Header -->
		<div class="z-10 flex h-10 items-center border-b bg-muted/50 px-4">
			<span class="font-mono text-xs text-muted-foreground/80">script.lua</span>
		</div>
		<!-- Monaco DOM Container -->
		<div bind:this={editorContainer} class="w-full flex-1 bg-[#1e1e1e]"></div>
	</div>

	<!-- Dummy error / console output text area -->
	<div
		class="flex h-28 w-full flex-col overflow-y-auto rounded-lg border bg-[#1e1e1e] p-3 font-mono text-sm text-[#f87171] shadow-sm"
	>
		<div class="mb-2 flex items-center justify-between">
			<span class="font-sans text-xs font-semibold tracking-widest text-muted-foreground uppercase">
				Terminal
			</span>
		</div>
		<div class="flex items-start opacity-70">
			<span class="mr-3 font-bold text-muted-foreground">&gt;</span>
			<span class="font-sans text-muted-foreground italic">
				No errors to display. Ready to compile.
			</span>
		</div>
	</div>
</div>
