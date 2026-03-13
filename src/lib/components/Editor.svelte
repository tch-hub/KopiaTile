<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import { uiState } from '$lib/states.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { Code } from '@lucide/svelte';
	import type * as Monaco from 'monaco-editor';

	let {
		code = $bindable(
			'-- Write your KopiaTile Lua script here\n\nif y == 1 then\n  return 2\nend\nreturn 1\n'
		),
		error = null,
		title = m.code_editor_title(),
		onManualChange = () => {}
	} = $props<{
		code?: string;
		error?: { line: number; message: string } | null;
		title?: string;
		onManualChange?: () => void;
	}>();

	let editorContainer: HTMLDivElement | null = $state(null);
	let editor: Monaco.editor.IStandaloneCodeEditor | null = $state(null);
	let monaco: typeof Monaco | null = null;
	let decorations: string[] = [];
	let completionProvider: Monaco.IDisposable | null = null;
	let isSettingValue = false; // 外部からsetValueするときの循環防止フラグ

	const COLORS = [
		'TRANSPARENT',
		'WHITE',
		'BLACK',
		'RED',
		'YELLOW',
		'GREEN',
		'BLUE',
		'PURPLE',
		'PINK'
	];
	const COLOR_REGEX = new RegExp(`\\b(${COLORS.join('|')})\\b`, 'gi');

	function updateColorHighlights() {
		if (!editor || !monaco) return;

		const model = editor.getModel();
		if (!model) return;

		const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];
		const text = model.getValue();
		let match;

		// 重複を避けるため正規表現の index をリセット
		COLOR_REGEX.lastIndex = 0;

		while ((match = COLOR_REGEX.exec(text)) !== null) {
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
							...COLORS.map((color) => ({
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
				if (isSettingValue) return; // 外部setValueによるイベントは無視
				const currentCode = editor?.getValue() || '';
				code = currentCode;

				if (editor && monaco) {
					const model = editor.getModel();
					if (model) {
						const edits: Monaco.editor.IIdentifiedSingleEditOperation[] = [];
						let match;

						COLOR_REGEX.lastIndex = 0;
						while ((match = COLOR_REGEX.exec(currentCode)) !== null) {
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
				onManualChange();
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

	$effect(() => {
		// code を追跡（リアクティブ依存として登録）
		const newCode = code;
		// editor.getValue() は untrack 内で呼び出してリアクティブ追跡を避ける
		untrack(() => {
			if (editor && newCode !== undefined && newCode !== editor.getValue()) {
				isSettingValue = true;
				editor.setValue(newCode || '');
				isSettingValue = false;
				updateColorHighlights();
			}
		});
	});

	$effect(() => {
		if (editor) {
			editor.updateOptions({
				cursorBlinking: uiState.isLowPerformanceMode ? 'solid' : 'blink',
				renderWhitespace: uiState.isLowPerformanceMode ? 'none' : 'selection',
				guides: {
					indentation: !uiState.isLowPerformanceMode
				}
			});
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

<div class="flex h-full flex-col">
	<div
		class="relative flex w-full flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-sm"
	>
		<!-- Editor Header -->
		<div class="z-10 flex h-10 items-center justify-between border-b bg-muted/50 px-4">
			<div class="flex items-center gap-2">
				<Code class="h-4 w-4 text-muted-foreground/70" />
				<span class="text-xs font-bold tracking-wider text-muted-foreground uppercase">
					{title}
				</span>
			</div>
			<span class="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase"
				>script.lua</span
			>
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
