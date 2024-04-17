import { PayloadAction, Unsubscribe, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { AppStartListening } from '@store'
import { MovieType } from '@store/kinopoisk'
import { AtLeastOneMergeSettings, AtLeastOneSettings, Bookmarks, IInitialStateSettings, ISettings, SearchHistory, SearchHistoryMovie, SearchHistoryMovieList, SearchHistoryPerson, SettingKey, WatchHistory, settingsExtraActions } from '@store/settings'
import mergeOptions from 'merge-options'
import { ToastAndroid } from 'react-native'

const COUNT_SAVE_TO_HISTORY = 15

const initialState: IInitialStateSettings = {
	settings: {
		_settings_time: 0,
		_settings_version: 1,
		theme: null,
		showDevOptions: false,
		watchHistory: {},
		searchHistory: {},
		bookmarks: {}
	},
	isLoading: true,
	isLoaded: false,
	lastSaveTime: 0
}

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setItem: (state, { payload }: PayloadAction<AtLeastOneSettings>) => {
			state.settings._settings_time = Date.now()
			for (const option in payload) {
				state.settings[option as SettingKey] = payload[option as SettingKey] as never
			}
		},
		mergeItem: (state, { payload }: PayloadAction<AtLeastOneMergeSettings>) => {
			state.settings._settings_time = Date.now()
			for (const option in payload) {
				const itemValue = (payload as any)[option as SettingKey]

				if (option in state.settings && state.settings[option as SettingKey] && itemValue) {
					state.settings[option as SettingKey] = mergeOptions.call({ concatArrays: true, ignoreUndefined: true }, state.settings[option as SettingKey] as object, itemValue as object) as never
				} else {
					state.settings[option as SettingKey] = itemValue as never
				}
			}
		},
		removeItem: (state, { payload: { key } }: PayloadAction<{ key: SettingKey }>) => {
			state.settings._settings_time = Date.now()
			delete state.settings[key]
		},
		removeItemByPath: (state, { payload }: PayloadAction<[SettingKey, string]>) => {
			state.settings._settings_time = Date.now()
			if (state.settings[payload[0]] && (state.settings[payload[0]] as any)[payload[1]]) {
				delete (state.settings[payload[0]] as any)[payload[1]]
			}
		},
		addItemToSearchHistory: (state, { payload }: PayloadAction<Omit<SearchHistoryMovie, 'timestamp'> | Omit<SearchHistoryPerson, 'timestamp'> | Omit<SearchHistoryMovieList, 'timestamp'>>) => {
			const searchHistoryData = Object.values(state.settings.searchHistory).sort((a, b) => b.timestamp - a.timestamp)

			const filteredData = searchHistoryData.filter(it => !(it.id === payload.id && it.type === payload.type))
			const updatedData = [{ ...payload, timestamp: Date.now() }, ...filteredData].sort((a, b) => b.timestamp - a.timestamp).slice(0, COUNT_SAVE_TO_HISTORY)

			const newSearchHistory = updatedData.reduce<{ [key: string]: SearchHistory }>((acc, item) => {
				acc[`${item.type}:${item.id}`] = item
				return acc
			}, {})

			state.settings._settings_time = Date.now()
			state.settings.searchHistory = newSearchHistory
		},
		updateWatchHistory: (state, { payload }: PayloadAction<{ title: string; poster: string | null; year: number | null; id: number | `tt${number}`; type: MovieType } | null>) => {
			if (!payload) return
			const { id, ...data } = payload

			const watchHistory = state.settings.watchHistory[`${id}`] as WatchHistory | undefined
			if (!watchHistory) return

			if (data.title !== watchHistory.title || data.poster !== watchHistory.poster || data.year !== watchHistory.year || data.type !== watchHistory.type) {
				console.log('change watch history', data)
				state.settings.watchHistory[`${id}`] = { ...watchHistory, ...data }
			} else {
				console.log('use old watch history', data)
			}
		},
		updateBookmarks: (state, { payload }: PayloadAction<{ title: string; poster: string | null; year: number | null; id: number | `tt${number}`; type: MovieType } | { title: string; poster: string | null; id: number; type: 'Person' } | null>) => {
			if (!payload) return
			const { id, ...data } = payload

			const bookmarks = state.settings.bookmarks[`${data.type}:${id}`] as Bookmarks | undefined
			if (!bookmarks) return

			if (data.title !== bookmarks.title || data.poster !== bookmarks.poster || data.type !== bookmarks.type) {
				console.log('change bookmarks', data)
				state.settings.bookmarks[`${data.type}:${id}`] = { ...bookmarks, ...data, type: data.type as never }
			} else {
				console.log('use old bookmarks', data)
			}
		}
	},
	extraReducers: builder => {
		builder

			// getSettings
			.addCase(settingsExtraActions.getSettings.pending, state => {
				state.isLoading = true
				state.isLoaded = false
			})
			.addCase(settingsExtraActions.getSettings.fulfilled, (state, { payload }) => {
				state.isLoading = false

				if (payload.local !== null && payload.server !== null) {
					let settings: ISettings

					// NOTE: Если при слиянии данных возникнут конфликты, вам нужно будет разработать логику разрешения конфликтов и уведомления пользователей о них. Например, вы можете предоставить пользователю возможность выбора, какую версию настроек сохранить.
					if (payload.local._settings_time === payload.server._settings_time) {
						settings = payload.server // Настройки равны
						console.log('getSettings (local === server) use server')
					} else if (payload.local._settings_time > payload.server._settings_time) {
						// TODO: window confirm settings actual
						settings = payload.local // Локальные настройки более актуальные
						console.log('getSettings (local > server) use local')
						// TODO: save actual settings
					} else {
						// TODO: window confirm settings actual
						settings = payload.server // Серверные настройки более актуальные
						console.log('getSettings (local < server) use server')
						// TODO: save actual settings
					}

					for (const option in settings) {
						// NOTE: if (option in state.settings) удаляет кастомные настройки (например 'favorites:id:category': {...})
						state.settings[option as never] = settings[option as never]
					}
				} else {
					const settings = payload.local ?? payload.server
					if (settings !== null) {
						for (const option in settings) {
							// NOTE: if (option in state.settings) удаляет кастомные настройки (например 'favorites:id:category': {...})
							state.settings[option as never] = settings[option as never]
						}
					}
				}

				state.isLoaded = true
			})
			.addCase(settingsExtraActions.getSettings.rejected, (state, { error: { message } }) => {
				state.isLoading = false
				ToastAndroid.show('Ошибка получения настроек: ' + message, ToastAndroid.LONG)
			})

			// saveSettings
			.addCase(settingsExtraActions.saveSettings.pending, state => {
				state.isLoading = true
			})
			.addCase(settingsExtraActions.saveSettings.fulfilled, (state, { payload }) => {
				state.isLoading = false
				// if (!payload.local || !payload.server) {
				// 	console.warn(`Ошибка сохранения настроек: ${payload.server ? 'Local' : 'Server'}`)
				// }
			})
	}
})

export const { actions, reducer } = settingsSlice

export const setupSettingsListeners = (startListening: AppStartListening): Unsubscribe =>
	startListening({
		matcher: isAnyOf(actions.setItem, actions.mergeItem, actions.removeItem, actions.removeItemByPath),
		effect: async (action, listenerApi) => {
			listenerApi.dispatch(settingsExtraActions.saveSettings())
		}
	})
