import { PayloadAction, Unsubscribe, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { ToastAndroid } from 'react-native'
import { AppStartListening } from '../listenerMiddleware'
import { getSettings, saveSettings } from './settings.actions'

export interface ISettings {
	[key: `test:${number}:${string}`]: { name: string; id: number }
	_settings_time: number
	_settings_version: number
	testValue: string
	theme: null | true
	showDevOptions: boolean
}

// type SettingsValueTypes = {
// 	[key in keyof ISettings]: ISettings[key]
// }

interface IInitialStateSettings {
	settings: ISettings
	isLoading: boolean
	isLoaded: boolean
	lastSaveTime: number
}

const initialState: IInitialStateSettings = {
	settings: {
		_settings_time: 0,
		_settings_version: 1,
		testValue: '',
		theme: true,
		showDevOptions: false
	},
	isLoading: true,
	isLoaded: false,
	lastSaveTime: 0
}

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		// TODO value: PayloadAction<{ key: keyof ISettings; value: SettingsValueTypes[keyof ISettings] }>
		setItem: (state, { payload: { key, value } }: PayloadAction<{ key: keyof ISettings; value: unknown }>) => {
			state.settings._settings_time = Date.now()
			state.settings[key] = value as never
		},
		removeItem: (state, { payload: { key } }: PayloadAction<{ key: keyof ISettings }>) => {
			state.settings._settings_time = Date.now()
			delete state.settings[key]
		}
	},
	extraReducers: builder => {
		builder

			// getSettings
			.addCase(getSettings.pending, state => {
				state.isLoading = true
				state.isLoaded = false
			})
			.addCase(getSettings.fulfilled, (state, { payload }) => {
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
			.addCase(getSettings.rejected, (state, { error: { message } }) => {
				state.isLoading = false
				ToastAndroid.show('Ошибка получения настроек: ' + message, ToastAndroid.LONG)
			})

			// saveSettings
			.addCase(saveSettings.pending, state => {
				state.isLoading = true
			})
			.addCase(saveSettings.fulfilled, (state, { payload }) => {
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
		matcher: isAnyOf(actions.setItem, actions.removeItem),
		effect: async (action, listenerApi) => {
			listenerApi.dispatch(saveSettings())
		}
	})
