import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Gets the localized text from a ProblemText object or string.
 */
export function getLocaleText(
	text: string | Record<string, string>,
	currentLocale: string,
	fallback: () => string = () => ''
): string {
	if (typeof text === 'string') {
		return text;
	}
	if (text[currentLocale]) {
		return text[currentLocale];
	}
	// Fallback to English if available, otherwise first available or fallback function
	return text['en'] || Object.values(text)[0] || fallback();
}
