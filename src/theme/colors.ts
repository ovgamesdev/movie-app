export type ColorScheme = 'light' | 'dark'

export type ColorTypes = {
	colorScheme: ColorScheme

	warning: '#d13c3c' | '#bd3939'
	success: '#1ea82d' | '#22BB33'

	primary100: '#1E2022' | '#0085ff'
	primary200: '#34373b' | '#69b4ff'
	primary300: '#F0F5F9' | '#e0ffff'
	accent100: '#788189' | '#006fff'
	accent200: '#e1e4e6' | '#e1ffff'
	text100: '#1E2022' | '#FFFFFF'
	text200: '#52616B' | '#9e9e9e'
	bg100: '#F0F5F9' | '#1E1E1E'
	bg200: '#C9D6DF' | '#2d2d2d'
	bg300: '#bfc7d1' | '#454545'
}

export const COLORS: { light: ColorTypes; dark: ColorTypes } = {
	light: {
		colorScheme: 'light',

		warning: '#d13c3c',
		success: '#1ea82d',

		primary100: '#1E2022',
		primary200: '#34373b',
		primary300: '#F0F5F9',
		accent100: '#788189',
		accent200: '#e1e4e6',
		text100: '#1E2022',
		text200: '#52616B',
		bg100: '#F0F5F9',
		bg200: '#C9D6DF',
		bg300: '#bfc7d1'
	},
	dark: {
		colorScheme: 'dark',

		warning: '#bd3939',
		success: '#22BB33',

		primary100: '#0085ff',
		primary200: '#69b4ff',
		primary300: '#e0ffff',
		accent100: '#006fff',
		accent200: '#e1ffff',
		text100: '#FFFFFF',
		text200: '#9e9e9e',
		bg100: '#1E1E1E',
		bg200: '#2d2d2d',
		bg300: '#454545'
	}
}
