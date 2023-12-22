export interface IInitialStateSettings {
	settings: ISettings
	isLoading: boolean
	isLoaded: boolean
	lastSaveTime: number
}

export interface ISettings {
	[key: `test:${number}:${string}`]: { name: string; id: number; value?: number; testArray?: { id: number; value?: string }[] }
	watchHistory: {
		[key: `${number}:${string}`]: {
			id: number
			type: 'Film' | 'TvSeries' | 'MiniSeries'
			title: string
			poster: string | null
			year: number | null
			timestamp: number
			//
			duration?: number
			lastTime?: number
			status?: 'watch' | 'pause' | 'end'
		}
	}
	_settings_time: number
	_settings_version: number
	theme: null | 'light' | 'dark'
	showDevOptions: boolean
}

export type SettingKey = keyof ISettings

type MakeValuesPartial<T> = {
	[K in keyof T]: T[K] extends object ? Partial<MakeValuesPartial<T[K]>> : T[K]
}

export type AtLeastOne<T extends Record<string, any>> = keyof T extends infer K ? (K extends string ? Pick<T, K & keyof T> & Partial<T> : never) : never
export type AtLeastOneMerge<T extends Record<string, any>> = keyof T extends infer K ? (K extends string ? MakeValuesPartial<Pick<T, K & keyof T>> : never) : never
export type AtLeastOneSettings = AtLeastOne<ISettings>
export type AtLeastOneMergeSettings = AtLeastOneMerge<ISettings>

export type InputSettingsKey = undefined
export type SwitchSettingsKey = 'showDevOptions'
export type SelectSettingsKey = 'theme'
