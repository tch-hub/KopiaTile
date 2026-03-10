import type { PixelEngine } from './types';
import LuaWorker from './lua.worker?worker';

export class LuaPixelEngine implements PixelEngine {
	private worker: Worker | null = null;
	private compilePromiseResolver: { resolve: () => void; reject: (err: any) => void } | null = null;
	private evaluatePromiseResolver: {
		resolve: (res: number[][]) => void;
		reject: (err: any) => void;
	} | null = null;
	private isCompiling: boolean = false;
	private evaluateTimeoutId: any = null;

	constructor() {
		this.initWorker();
	}

	private initWorker() {
		if (this.worker) {
			this.worker.terminate();
		}
		this.worker = new LuaWorker();
		this.worker.onmessage = (e) => {
			const data = e.data;
			if (data.type === 'compile_success') {
				if (this.compilePromiseResolver) {
					this.compilePromiseResolver.resolve();
					this.compilePromiseResolver = null;
				}
			} else if (data.type === 'compile_error') {
				if (this.compilePromiseResolver) {
					this.compilePromiseResolver.reject(new Error(data.error));
					this.compilePromiseResolver = null;
				}
			} else if (data.type === 'evaluate_success') {
				if (this.evaluatePromiseResolver) {
					if (this.evaluateTimeoutId) {
						clearTimeout(this.evaluateTimeoutId);
						this.evaluateTimeoutId = null;
					}
					this.evaluatePromiseResolver.resolve(data.result);
					this.evaluatePromiseResolver = null;
				}
			} else if (data.type === 'evaluate_error') {
				if (this.evaluatePromiseResolver) {
					if (this.evaluateTimeoutId) {
						clearTimeout(this.evaluateTimeoutId);
						this.evaluateTimeoutId = null;
					}
					this.evaluatePromiseResolver.reject(new Error(data.error));
					this.evaluatePromiseResolver = null;
				}
			}
		};
	}

	async compile(code: string): Promise<void> {
		if (this.isCompiling) return;
		this.isCompiling = true;

		try {
			// 前回の評価が走っていたらキャンセルする
			if (this.evaluatePromiseResolver) {
				if (this.evaluateTimeoutId) {
					clearTimeout(this.evaluateTimeoutId);
					this.evaluateTimeoutId = null;
				}
				this.evaluatePromiseResolver.reject(new Error('Compilation started'));
				this.evaluatePromiseResolver = null;
			}

			return new Promise((resolve, reject) => {
				this.compilePromiseResolver = { resolve, reject };
				if (this.worker) {
					this.worker.postMessage({ type: 'compile', code });
				} else {
					reject(new Error('Worker not initialized'));
				}
			});
		} finally {
			this.isCompiling = false;
		}
	}

	async evaluateAll(width: number, height: number): Promise<number[][]> {
		const worker = this.worker;
		if (!worker) {
			throw new Error('Worker not initialized.');
		}

		return new Promise((resolve, reject) => {
			this.evaluatePromiseResolver = { resolve, reject };

			// 2秒間のタイムアウトを設定。超過した場合は強制終了してエラーとする
			this.evaluateTimeoutId = setTimeout(() => {
				if (this.evaluatePromiseResolver) {
					this.evaluatePromiseResolver.reject(
						new Error('Execution timeout. Infinite loop detected?')
					);
					this.evaluatePromiseResolver = null;
				}
				// 応答のないWorkerは強制終了して新しく作り直す
				this.initWorker();
			}, 2000);

			worker.postMessage({ type: 'evaluateAll', width, height });
		});
	}

	dispose(): void {
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
		if (this.evaluateTimeoutId) {
			clearTimeout(this.evaluateTimeoutId);
		}
	}
}
