import { UnistylesRuntime } from 'react-native-unistyles'

type ColorValue = keyof ColorTypes | `rgb${string}` | `#${string}`

type ColorForTheme<T> = { light: T; dark: T }

const getColorForTheme = <T extends ColorValue>(theme: ColorForTheme<T>, colors: ColorTypes): string => {
	const value = UnistylesRuntime.themeName in theme ? theme[UnistylesRuntime.themeName] : UnistylesRuntime.colorScheme in theme && UnistylesRuntime.colorScheme !== 'unspecified' ? theme[UnistylesRuntime.colorScheme] : theme.light

	if (value in colors) {
		return colors[value as keyof ColorTypes]
	}

	return value
}

export interface ColorTypes {
	colorScheme: string

	warning: string
	success: string

	primary100: string
	primary200: string
	primary300: string
	accent100: string
	accent200: string
	text100: string
	text200: string
	bg100: string
	bg200: string
	bg300: string
}
interface Margins {
	sm: number
	md: number
	lg: number
	xl: number
}

interface Theme {
	colors: ColorTypes
	margins: Margins
	getColorForTheme: <T extends ColorValue>(value: ColorForTheme<T>) => string
}

const lightColors: ColorTypes = {
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
}

export const lightTheme: Theme = {
	colors: lightColors,
	margins: {
		sm: 2,
		md: 4,
		lg: 8,
		xl: 12
	},
	getColorForTheme: <T extends ColorValue>(value: ColorForTheme<T>) => getColorForTheme<T>(value, lightColors)
} as const

const darkColors: ColorTypes = {
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

export const darkTheme: Theme = {
	colors: darkColors,
	margins: {
		sm: 2,
		md: 4,
		lg: 8,
		xl: 12
	},
	getColorForTheme: <T extends ColorValue>(value: ColorForTheme<T>) => getColorForTheme<T>(value, darkColors)
} as const

// define other themes
