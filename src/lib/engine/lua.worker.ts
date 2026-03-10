import { LuaFactory, LuaEngine as WasmoonEngine } from 'wasmoon';
import { GRID_RADIUS, GRID_SIZE } from '$lib/config';

let factory: LuaFactory | null = null;
let lua: WasmoonEngine | null = null;

factory = new LuaFactory();

addEventListener('message', async (e: MessageEvent) => {
	const data = e.data;
	if (data.type === 'compile') {
		try {
			if (lua) {
				lua.global.close();
			}
			lua = await factory!.createEngine();

			const code = data.code;
			const wrappedCode = `
local abs = math.abs

local TRANSPARENT = 0
local WHITE = 1
local BLACK = 2
local RED = 3
local BLUE = 4
function _evaluate_pixel(x, y, width, height)
${code}
end

function _evaluate_all(width, height)
    local result = {}
    local index_y = 0
    -- Y座標は上が${GRID_RADIUS}、下が-${GRID_RADIUS}となるように 
    for y = ${GRID_RADIUS}, -${GRID_RADIUS}, -1 do
        local row = {}
        local index_x = 0
        for x = -${GRID_RADIUS}, ${GRID_RADIUS} do
            local color = _evaluate_pixel(x, y, width, height)
            if color == nil then
                color = 0 -- デフォルトは透明(空)
            end
            row[index_x] = color
            index_x = index_x + 1
        end
        result[index_y] = row
        index_y = index_y + 1
    end
    return result
end
`;
			await lua.doString(wrappedCode);
			postMessage({ type: 'compile_success' });
		} catch (err: any) {
			postMessage({ type: 'compile_error', error: err.message || String(err) });
		}
	} else if (data.type === 'evaluateAll') {
		try {
			if (!lua) {
				throw new Error('Engine not compiled. Call compile() first.');
			}
			const evaluateAllFunc = lua.global.get('_evaluate_all');
			if (typeof evaluateAllFunc !== 'function') {
				throw new Error('Evaluation function not found in Lua environment.');
			}
			const result = await evaluateAllFunc(data.width, data.height);

			// normalizeResult
			const grid: number[][] = [];
			for (let y = 0; y < GRID_SIZE; y++) {
				const rowArr = result[y] || result[String(y)];
				const row: number[] = [];
				for (let x = 0; x < GRID_SIZE; x++) {
					let val = rowArr ? rowArr[x] || rowArr[String(x)] : undefined;
					if (typeof val !== 'number') {
						val = 0; // フォールバック (透明)
					}
					row.push(val);
				}
				grid.push(row);
			}

			postMessage({ type: 'evaluate_success', result: grid });
		} catch (err: any) {
			postMessage({ type: 'evaluate_error', error: err.message || String(err) });
		}
	}
});
