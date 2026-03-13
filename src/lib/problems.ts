export type Problem = {
	id: string;
	title: string;
	description: string;
	initialCode: string;
	targetCode: string;
};

export const problems: Problem[] = [
	{
		id: '1',
		title: 'problem_1_title',
		description: 'problem_1_desc',
		initialCode: '-- 白(WHITE)を返してみよう\nreturn 0',
		targetCode: 'return WHITE'
	},
	{
		id: '2',
		title: 'problem_2_title',
		description: 'problem_2_desc',
		initialCode:
			'if x > 0 then\n    -- ここに正しいコードを書いてみよう\nelse\n    -- ここに正しいコードを書いてみよう\nend',
		targetCode: 'if x > 0 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '3',
		title: 'problem_3_title',
		description: 'problem_3_desc',
		initialCode:
			'-- y が 0 より小さいときの条件を書いてみよう\nif ... then\n    return RED\nelse\n    return WHITE\nend',
		targetCode: 'if y < 0 then\n    return RED\nelse\n    return WHITE\nend'
	},
	{
		id: '4',
		title: 'problem_4_title',
		description: 'problem_4_desc',
		initialCode:
			'-- x が正、かつ y が負の条件を書いてみよう\nif ... then\n    return BLUE\nelse\n    return WHITE\nend',
		targetCode: 'if x > 0 and y < 0 then\n    return BLUE\nelse\n    return WHITE\nend'
	},
	{
		id: '5',
		title: 'problem_5_title',
		description: 'problem_5_desc',
		initialCode:
			'-- x と y がどちらも 0 のときだけ BLACK を返すようにしよう\nif ... then\n    return BLACK\nend\n\nreturn WHITE',
		targetCode: 'if x == 0 and y == 0 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '6',
		title: 'problem_6_title',
		description: 'problem_6_desc',
		initialCode:
			'-- x が 0 または y が 0 の条件を書いてみよう\nif ... then\n    return BLACK\nelse\n    return WHITE\nend',
		targetCode: 'if x == 0 or y == 0 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '7',
		title: 'problem_7_title',
		description: 'problem_7_desc',
		initialCode:
			'-- 一番外側（x か y が -4 か 4）の条件を組み合わせてみよう\nif ... then\n    return BLACK\nelse\n    return WHITE\nend',
		targetCode:
			'if x == -4 or x == 4 or y == -4 or y == 4 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '8',
		title: 'problem_8_title',
		description: 'problem_8_desc',
		initialCode:
			'-- (x + y) を 2 で割った余りが 0 の条件を書いてみよう\nif ... then\n    return BLACK\nelse\n    return WHITE\nend',
		targetCode: 'if (x + y) % 2 == 0 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '9',
		title: 'problem_9_title',
		description: 'problem_9_desc',
		initialCode:
			'-- 絶対値 abs(x) と abs(y) の合計が 4 以下の条件を書いてみよう\nif ... then\n    return BLACK\nelse\n    return WHITE\nend',
		targetCode: 'if abs(x) + abs(y) <= 4 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '10',
		title: 'problem_10_title',
		description: 'problem_10_desc',
		initialCode:
			'-- 距離の2乗 (x*x + y*y) が 4 以下の条件を書いてみよう\nif ... then\n    return RED\nelse\n    return TRANSPARENT\nend',
		targetCode: 'if x*x + y*y <= 4 then\n    return RED\nelse\n    return TRANSPARENT\nend'
	}
];
