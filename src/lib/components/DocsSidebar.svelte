<script lang="ts">
	import { fly } from 'svelte/transition';
	import { X } from '@lucide/svelte';
	import SyntaxDocs from '../syntax.md';

	let { isOpen = false, onClose } = $props<{ isOpen: boolean; onClose: () => void }>();
</script>

{#if isOpen}
	<aside
		class="fixed top-0 right-0 bottom-0 z-50 flex w-96 flex-col border-l bg-background shadow-2xl"
		transition:fly={{ x: 100, duration: 250 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b px-4 py-3">
			<h2 class="text-lg font-semibold tracking-tight">Documentation</h2>
			<button
				onclick={onClose}
				class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none"
			>
				<X class="h-5 w-5" />
				<span class="sr-only">Close documentation</span>
			</button>
		</div>

		<!-- Content -->
		<div class="prose prose-sm max-w-none flex-1 overflow-y-auto px-6 py-6 pb-20 dark:prose-invert">
			<SyntaxDocs />
		</div>
	</aside>
{/if}

<style>
	/* Tailwind Typographyのデフォルトのバッククォート(::before, ::after)を消去 */
	:global(.prose code::before),
	:global(.prose code::after) {
		display: none !important;
	}

	/* インラインコードの背景とパディングを調整して「コードブロック」らしく見せる */
	/* pre配下ではないcodeタグのみに適用 */
	:global(.prose :not(pre) > code) {
		background-color: var(--color-muted, #f3f4f6);
		color: var(--color-foreground, #1f2937);
		padding: 0.15rem 0.3rem;
		border-radius: 0.25rem;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 0.85em;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	:global(.dark .prose :not(pre) > code) {
		background-color: rgba(255, 255, 255, 0.1);
		color: #e5e7eb;
		border-color: rgba(255, 255, 255, 0.2);
	}

	/* マルチラインコードブロック(pre)のスタイル調整 */
	:global(.prose pre) {
		background-color: #1e1e1e !important;
		color: #d4d4d4 !important;
		padding: 1rem !important;
		border-radius: 0.5rem !important;
		overflow-x: auto;
		line-height: 1.5;
		margin: 1.5rem 0 !important;
	}

	:global(.prose pre code) {
		background: transparent !important;
		padding: 0 !important;
		border: none !important;
		font-size: 0.9em !important;
		color: inherit !important;
	}
</style>
