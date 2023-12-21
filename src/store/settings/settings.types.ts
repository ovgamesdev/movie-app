export interface IInitialStateSettings {
	settings: ISettings
	isLoading: boolean
	isLoaded: boolean
	lastSaveTime: number
}

export interface ISettings {
	[key: `test:${number}:${string}`]: { name: string; id: number; value?: number; testArray?: { id: number; value?: string }[] }
	_settings_time: number
	_settings_version: number
	kinopoiskToken: string
	theme: null | 'light' | 'dark'
	showDevOptions: boolean
}

export type SettingKey = keyof ISettings

type MakeValuesPartial<T> = {
	[K in keyof T]: T[K] extends object ? Partial<T[K]> : T[K]
}

export type AtLeastOne<T extends Record<string, any>> = keyof T extends infer K ? (K extends string ? Pick<T, K & keyof T> & Partial<T> : never) : never
export type AtLeastOneMerge<T extends Record<string, any>> = keyof T extends infer K ? (K extends string ? MakeValuesPartial<Pick<T, K & keyof T>> : never) : never
export type AtLeastOneSettings = AtLeastOne<ISettings>
export type AtLeastOneMergeSettings = AtLeastOneMerge<ISettings>

export type InputSettingsKey = 'kinopoiskToken'
export type SwitchSettingsKey = 'showDevOptions'
export type SelectSettingsKey = 'theme'
