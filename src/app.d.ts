// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	const APP_BASE_PATH: string;
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '*.md' {
	import { Component } from 'svelte';
	const component: Component;
	export default component;
}

export {};
