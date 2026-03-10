import { LuaFactory, LuaEngine as WasmoonEngine } from 'wasmoon';
import type { PixelEngine } from './types';
import { GRID_RADIUS, GRID_SIZE } from '$lib/config';

export class LuaPixelEngine implements PixelEngine {
	private factory: LuaFactory;
	private lua: WasmoonEngine | null = null;
	private isCompiling: boolean = false;

	constructor() {
		// wasmoonのファクトリ初期化
		this.factory = new LuaFactory();
	}

	async compile(code: string): Promise<void> {
		if (this.isCompiling) return;
		this.isCompiling = true;

		try {
			if (this.lua) {
				this.lua.global.close();
			}
			// 新しいLuaエンジンインスタンスを作成
			this.lua = await this.factory.createEngine();

			// ユーザーコードをラップして、各ピクセルごとに実行できる関数を定義する
			// 戻り値がない場合は0(透明)をデフォルトとする
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
			await this.lua.doString(wrappedCode);
		} finally {
			this.isCompiling = false;
		}
	}

	async evaluateAll(width: number, height: number): Promise<number[][]> {
		if (!this.lua) {
			throw new Error('Engine not compiled. Call compile() first.');
		}

		try {
			const evaluateAllFunc = this.lua.global.get('_evaluate_all');
			if (typeof evaluateAllFunc !== 'function') {
				throw new Error('Evaluation function not found in Lua environment.');
			}

			// Lua側の関数を実行し、テーブル(配列)を受け取る
			const result = await evaluateAllFunc(width, height);

			return this.normalizeResult(result);
		} catch (e) {
			console.error('Lua execution error:', e);
			throw e;
		}
	}

	/**
	 * wasmoonから返却されたLuaのテーブルをJSの0オリジンな標準2次元配列に変換する
	 */
	private normalizeResult(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		luaResult: any
	): number[][] {
		const grid: number[][] = [];
		// Lua側で [0] ~ [4] のキーで保存されているため、0から4のループになる
		for (let y = 0; y < GRID_SIZE; y++) {
			const rowArr = luaResult[y] || luaResult[String(y)];
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
		return grid;
	}

	dispose(): void {
		if (this.lua) {
			this.lua.global.close();
			this.lua = null;
		}
	}
}
