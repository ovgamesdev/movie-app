import { PayloadAction, Unsubscribe, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { AppStartListening } from '@store'
import { AtLeastOneMergeSettings, AtLeastOneSettings, IInitialStateSettings, ISettings, SettingKey, settingsExtraActions } from '@store/settings'
import mergeOptions from 'merge-options'
import { ToastAndroid } from 'react-native'

const initialState: IInitialStateSettings = {
	settings: {
		_settings_time: 0,
		_settings_version: 1,
		theme: null,
		showDevOptions: false,
		watchHistory: {},
		searchHistory: {}
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

				console.log('getSettings', payload)

				if (payload.local !== null && payload.server !== null) {
					let settings: ISettings

					// NOTE: Если при слиянии данных возникнут конфликты, вам нужно будет разработать логику разрешения конфликтов и уведомления пользователей о них. Например, вы можете предоставить пользователю возможность выбора, какую версию настроек сохранить.
					if (payload.local._settings_time === payload.server._settings_time) {
						settings = payload.server // Настройки равны
					} else if (payload.local._settings_time > payload.server._settings_time) {
						// TODO: window confirm settings actual
						settings = payload.local // Локальные настройки более актуальные
						// TODO: save actual settings
					} else {
						// TODO: window confirm settings actual
						settings = payload.server // Серверные настройки более актуальные
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
