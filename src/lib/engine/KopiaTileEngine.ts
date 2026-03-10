import { LuaPixelEngine } from './LuaEngine';
import type { PixelEngine } from './types';

export class KopiaTileEngine {
    private engine: PixelEngine;
    private width: number;
    private height: number;

    constructor(width: number = 16, height: number = 16, engineType: 'lua' | 'js' = 'lua') {
        this.width = width;
        this.height = height;

        if (engineType === 'lua') {
            this.engine = new LuaPixelEngine();
        } else {
            throw new Error(`Engine type ${engineType} is not supported yet.`);
        }
    }

    /**
     * スクリプトをコンパイルする
     */
    async compile(code: string): Promise<void> {
        await this.engine.compile(code);
    }

    /**
     * 全ピクセルを評価し、色番号のグリッドを返す
     */
    async evaluate(): Promise<number[][]> {
        return await this.engine.evaluateAll(this.width, this.height);
    }

    /**
     * グリッドのサイズを変更する
     */
    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /**
     * リソースを解放する
     */
    dispose() {
        if (this.engine.dispose) {
            this.engine.dispose();
        }
    }
}
