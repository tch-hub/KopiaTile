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
		initialCode: 'return 0',
		targetCode: 'return WHITE'
	},
	{
		id: '2',
		title: 'problem_2_title',
		description: 'problem_2_desc',
		initialCode: 'return 0',
		targetCode: 'if x == 0 and y == 0 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '3',
		title: 'problem_3_title',
		description: 'problem_3_desc',
		initialCode: 'return 0',
		targetCode: 'if x == 0 or y == 0 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '4',
		title: 'problem_4_title',
		description: 'problem_4_desc',
		initialCode: 'return 0',
		targetCode: 'if (x + y) % 2 == 0 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '5',
		title: 'problem_5_title',
		description: 'problem_5_desc',
		initialCode: 'return 0',
		targetCode: 'if x == 0 or y == 0 then\n    return RED\nelse\n    return WHITE\nend'
	},
	{
		id: '6',
		title: 'problem_6_title',
		description: 'problem_6_desc',
		initialCode: 'return 0',
		targetCode: 'if abs(x) + abs(y) <= 4 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '7',
		title: 'problem_7_title',
		description: 'problem_7_desc',
		initialCode: 'return 0',
		targetCode: 'local dist_sq = x * x + y * y\n\nif dist_sq <= 4 then\n    return RED\nelse\n    return TRANSPARENT\nend'
	},
	{
		id: '8',
		title: 'problem_8_title',
		description: 'problem_8_desc',
		initialCode: 'return 0',
		targetCode: 'local dist_sq = x * x + y * y\n\nfor r = 1, 3 do\n    local r_sq = r * r\n    if dist_sq == r_sq then\n        return BLUE\n    end\nend\n\nreturn TRANSPARENT'
	},
	{
		id: '9',
		title: 'problem_9_title',
		description: 'problem_9_desc',
		initialCode: 'return 0',
		targetCode: 'if x == -4 or x == 4 or y == -4 or y == 4 then\n    return BLACK\nelse\n    return WHITE\nend'
	},
	{
		id: '10',
		title: 'problem_10_title',
		description: 'problem_10_desc',
		initialCode: 'return 0',
		targetCode: 'local dist = abs(x) + abs(y)\n\nif x == 0 and y == 0 then\n    return WHITE\nend\n\nif x == 0 or y == 0 then\n    return RED\nend\n\nif dist <= 3 then\n    return YELLOW\nend\n\nreturn BLACK'
	}
];
