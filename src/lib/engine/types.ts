export interface PixelEngine {
    /**
     * コンパイル（ユーザーが入力したコードをエンジンに登録・評価可能な状態にする）
     */
    compile(code: string): Promise<void>;
    
    /**
     * 全ピクセルの計算を行い、色番号の2次元配列を返す
     */
    evaluateAll(width: number, height: number): Promise<number[][]>;
    
    /**
     * リソースの解放
     */
    dispose(): void;
}
