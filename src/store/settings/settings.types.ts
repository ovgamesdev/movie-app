import { NavigationType } from '@navigation'
import { MovieType } from '@store/kinopoisk'

export interface IInitialStateSettings {
	settings: ISettings
	isLoading: boolean
	isLoaded: boolean
	lastSaveTime: number
	navigation: null | {
		method: 'push' | 'navigate'
		data: NavigationType
	}
}

// WatchHistory
export type WatchHistoryStatus = 'watch' | 'pause' | 'end' | 'new' | 'dropped' // TODO await
export type WatchHistoryProvider = 'ALLOHA' | 'COLLAPS' | 'VIDEOCDN' | 'KODIK' | `KODIK:${string}` | 'HDVB' | 'VOIDBOOST'
export type WatchHistory = {
	id: number | `tt${number}`
	provider: WatchHistoryProvider | null
	type: MovieType
	title: string
	poster: string | null
	year: number | null
	startTimestamp: number // Время начала просмотра
	timestamp: number // Время последнего просмотра
	status: WatchHistoryStatus
	//
	duration?: number | null
	lastTime?: number | null
	episode?: string | null
	season?: number | null
	translation?: { id: number; title: string } | null
	//
	notify?: boolean
	notifyTranslation?: string | null
	fileIndex?: number
	releasedEpisodes?: number
}

// SearchHistory
export type SearchHistoryMovie = {
	id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`
	type: MovieType
	title: string
	poster: string | null
	timestamp: number

	year: number | null
}
export type SearchHistoryPerson = {
	id: number
	type: 'Person'
	title: string
	poster: string | null
	timestamp: number
}
export type SearchHistoryMovieList = {
	id: number
	url: string
	type: 'MovieListMeta'
	title: string
	poster: string | null
	timestamp: number
}

// Bookmarks
export type BookmarksMovie = {
	id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`
	type: MovieType
	title: string
	poster: string | null
	timestamp: number

	year: number | null
}
export type BookmarksPerson = {
	id: number
	type: 'Person'
	title: string
	poster: string | null
	timestamp: number
}

export type SearchHistory = SearchHistoryMovie | SearchHistoryPerson | SearchHistoryMovieList
export type Bookmarks = BookmarksMovie | BookmarksPerson

export interface ISettings {
	[key: `test:${number}:${string}`]: { name: string; id: number; value?: number; testArray?: { id: number; value?: string }[] }
	watchHistory: {
		[key: `${number}` | `tt${number}`]: WatchHistory
	}
	searchHistory: {
		[key: `${SearchHistory['type']}:${number | `tt${number}`}`]: SearchHistory
	}
	bookmarks: {
		[key: `${Bookmarks['type']}:${number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`}`]: Bookmarks
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
