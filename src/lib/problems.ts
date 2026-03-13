export type ProblemText = string | { [lang: string]: string };

export type Problem = {
	id: string;
	difficulty: number;
	title: ProblemText;
	description: ProblemText;
	initialCode: string;
	targetCode: string;
};

// Viteの機能を使って、同ディレクトリ内の .md ファイルをすべて読み込む
const rawModules = import.meta.glob('./problems/*.md', { query: '?raw', eager: true });

function parseMarkdown(content: string): Problem {
	const frontmatterMatch = content.match(/^---([\s\S]*?)---/);
	if (!frontmatterMatch) throw new Error('Frontmatter not found');

	const yamlStr = frontmatterMatch[1];
	const metadata: any = {};

	// 簡易的なYAMLパース（id, title, description）
	const lines = yamlStr.split('\n');
	let currentKey = '';
	for (const line of lines) {
		const kvMatch = line.match(/^(\w+):\s*(.*)$/);
		if (kvMatch) {
			const key = kvMatch[1];
			const val = kvMatch[2].trim();
			if (val) {
				metadata[key] = val.replace(/^['"](.*)['"]$/, '$1'); // クォート除去
			} else {
				currentKey = key;
				metadata[key] = {};
			}
		} else if (currentKey && line.startsWith('  ')) {
			const subKvMatch = line.trim().match(/^(\w+):\s*(.*)$/);
			if (subKvMatch) {
				metadata[currentKey][subKvMatch[1]] = subKvMatch[2].trim().replace(/^['"](.*)['"]$/, '$1');
			}
		}
	}

	// コードブロックの抽出
	const codes: { [key: string]: string } = {};
	const codeBlockRegex = /```\w+[:\s](\w+)\s*([\s\S]*?)```/g;
	let match;
	while ((match = codeBlockRegex.exec(content)) !== null) {
		codes[match[1]] = match[2].trim();
	}

	// ルール: 名前なしのコードブロックが2つある場合、1つ目を initial, 2つ目を target とする fallback
	if (!codes.initial || !codes.target) {
		const simpleBlocks = [...content.matchAll(/```\w+\s*([\s\S]*?)```/g)];
		if (simpleBlocks.length >= 2) {
			if (!codes.initial) codes.initial = simpleBlocks[0][1].trim();
			if (!codes.target) codes.target = simpleBlocks[1][1].trim();
		}
	}

	return {
		id: metadata.id || 'unknown',
		difficulty: parseInt(metadata.difficulty) || 0,
		title: metadata.title,
		description: metadata.description,
		initialCode: codes.initial || '',
		targetCode: codes.target || ''
	};
}

const parsedProblems = Object.entries(rawModules)
	.map(([path, module]) => {
		try {
			const content = (module as any).default;
			return parseMarkdown(content);
		} catch (e) {
			console.error(`Failed to parse ${path}:`, e);
			return null;
		}
	})
	.filter((p): p is Problem => p !== null)
	.sort((a, b) => a.difficulty - b.difficulty);

export const problems: Problem[] = parsedProblems;
