<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type * as Monaco from 'monaco-editor';

	let {
		code = $bindable(
			'-- Write your KopiaTile Lua script here\n\nif y == 1 then\n  return 2\nend\nreturn 1\n'
		),
		error = null
	} = $props<{ code?: string; error?: { line: number; message: string } | null }>();

	let editorContainer: HTMLDivElement | null = $state(null);
	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof Monaco | null = null;
	let decorations: string[] = [];

	function updateColorHighlights() {
		if (!editor || !monaco) return;

		const model = editor.getModel();
		if (!model) return;

		const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];
		const text = model.getValue();
		const colorRegex = /\b(TRANSPARENT|WHITE|BLACK|RED|BLUE)\b/g;
		let match;

		while ((match = colorRegex.exec(text)) !== null) {
			const startPos = model.getPositionAt(match.index);
			const endPos = model.getPositionAt(match.index + match[0].length);
			const color = match[1].toLowerCase();

			newDecorations.push({
				range: new monaco.Range(
					startPos.lineNumber,
					startPos.column,
					endPos.lineNumber,
					endPos.column
				),
				options: {
					inlineClassName: `kopiatile-highlight-${color}`
				}
			});
		}

		decorations = editor.deltaDecorations(decorations, newDecorations);
	}

	onMount(async () => {
		monaco = await import('monaco-editor');
		const editorWorker = await import('monaco-editor/esm/vs/editor/editor.worker?worker');

		(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
			getWorker: function () {
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
				updateColorHighlights();
			});

			// Initial highlight
			updateColorHighlights();
		}
	});

	$effect(() => {
		if (editor && monaco) {
			const model = editor.getModel();
			if (model) {
				if (error) {
					monaco.editor.setModelMarkers(model, 'lua', [
						{
							severity: monaco.MarkerSeverity.Error,
							message: error.message,
							startLineNumber: error.line,
							startColumn: 1,
							endLineNumber: error.line,
							endColumn: model.getLineMaxColumn(error.line)
						}
					]);
				} else {
					monaco.editor.setModelMarkers(model, 'lua', []);
				}
			}
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
				{m.terminal_title()}
			</span>
		</div>
		<div class="flex items-start opacity-70">
			<span class="mr-3 font-bold text-muted-foreground">&gt;</span>
			<span class="font-sans text-muted-foreground italic">
				{#if error}
					{m.terminal_error_line({ line: error.line, message: error.message })}
				{:else}
					{m.terminal_no_errors()}
				{/if}
			</span>
		</div>
	</div>
</div>

<style>
	:global(.kopiatile-highlight-transparent) {
		color: #ffffff !important;
		background-color: rgba(128, 128, 128, 0.5);
		border: 1px dashed rgba(255, 255, 255, 0.3);
		border-radius: 2px;
		padding: 0 2px;
		font-style: italic;
	}
	:global(.kopiatile-highlight-white) {
		color: #000000 !important;
		background-color: #ffffff !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-black) {
		color: #ffffff !important;
		background-color: #000000 !important;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-red) {
		color: #ffffff !important;
		background-color: #ff5555 !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-blue) {
		color: #ffffff !important;
		background-color: #55aaff !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
</style>
