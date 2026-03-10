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
	let completionProvider: Monaco.IDisposable | null = null;

	function updateColorHighlights() {
		if (!editor || !monaco) return;

		const model = editor.getModel();
		if (!model) return;

		const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];
		const text = model.getValue();
		const colorRegex = /\b(TRANSPARENT|WHITE|BLACK|RED|YELLOW|GREEN|BLUE|PURPLE|PINK)\b/g;
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
			completionProvider = monaco.languages.registerCompletionItemProvider('lua', {
				provideCompletionItems: (model, position) => {
					const word = model.getWordUntilPosition(position);
					const range = {
						startLineNumber: position.lineNumber,
						endLineNumber: position.lineNumber,
						startColumn: word.startColumn,
						endColumn: word.endColumn
					};
					const colors = [
						'WHITE',
						'BLACK',
						'RED',
						'YELLOW',
						'GREEN',
						'BLUE',
						'PURPLE',
						'PINK',
						'TRANSPARENT'
					];
					const keywords = [
						'if',
						'then',
						'else',
						'elseif',
						'end',
						'return',
						'for',
						'do',
						'while',
						'repeat',
						'until',
						'function',
						'local',
						'nil',
						'true',
						'false',
						'and',
						'or',
						'not'
					];

					return {
						suggestions: [
							...colors.map((color) => ({
								label: color,
								kind: monaco!.languages.CompletionItemKind.Constant,
								insertText: color,
								range: range
							})),
							...keywords.map((keyword) => ({
								label: keyword,
								kind: monaco!.languages.CompletionItemKind.Keyword,
								insertText: keyword,
								range: range
							}))
						]
					};
				}
			});

			editor = monaco.editor.create(editorContainer, {
				value: code,
				language: 'lua',
				theme: 'vs',
				automaticLayout: true,
				minimap: { enabled: false },
				fontSize: 14,
				fontFamily: 'Consolas, "Courier New", monospace',
				lineHeight: 21,
				padding: { top: 16 }
			});

			editor.onDidChangeModelContent(() => {
				const currentCode = editor?.getValue() || '';
				code = currentCode;

				if (editor && monaco) {
					const model = editor.getModel();
					if (model) {
						const colorRegex = /\b(transparent|white|black|red|yellow|green|blue|purple|pink)\b/gi;
						const edits: Monaco.editor.IIdentifiedSingleEditOperation[] = [];
						let match;

						while ((match = colorRegex.exec(currentCode)) !== null) {
							const matchedText = match[0];
							const upperText = matchedText.toUpperCase();
							// 大文字になっていない場合のみ置換
							if (matchedText !== upperText) {
								const startPos = model.getPositionAt(match.index);
								const endPos = model.getPositionAt(match.index + matchedText.length);
								edits.push({
									range: new monaco.Range(
										startPos.lineNumber,
										startPos.column,
										endPos.lineNumber,
										endPos.column
									),
									text: upperText
								});
							}
						}

						if (edits.length > 0) {
							// executeEditsはカーソル位置やUndo履歴を保持して置換する
							editor.executeEdits('auto-uppercase', edits);
						}
					}
				}

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
		if (completionProvider) {
			completionProvider.dispose();
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
		<div bind:this={editorContainer} class="w-full flex-1"></div>
	</div>
</div>

<style>
	:global(.kopiatile-highlight-transparent) {
		color: #333333 !important;
		background-color: var(--kopiatile-0) !important;
		border: 1px dashed rgba(0, 0, 0, 0.2);
		border-radius: 2px;
		padding: 0 2px;
		font-style: italic;
	}
	:global(.kopiatile-highlight-white) {
		color: #000000 !important;
		background-color: var(--kopiatile-1) !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-black) {
		color: #ffffff !important;
		background-color: var(--kopiatile-2) !important;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-red) {
		color: #ffffff !important;
		background-color: var(--kopiatile-3) !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-yellow) {
		color: #000000 !important;
		background-color: var(--kopiatile-4) !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-green) {
		color: #ffffff !important;
		background-color: var(--kopiatile-5) !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-blue) {
		color: #ffffff !important;
		background-color: var(--kopiatile-6) !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-purple) {
		color: #ffffff !important;
		background-color: var(--kopiatile-7) !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
	:global(.kopiatile-highlight-pink) {
		color: #ffffff !important;
		background-color: var(--kopiatile-8) !important;
		border-radius: 2px;
		padding: 0 2px;
		font-weight: bold;
	}
</style>
