import { createSlice } from '@reduxjs/toolkit'
import { ToastAndroid } from 'react-native'
import { getSettings, saveSettings, setItem } from './settings.actions'

export interface ISettings {
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
	isLoading: false,
	lastSaveTime: 0
}

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		// TODO: PayloadAction<{ key: keyof ISettings; value: SettingsValueTypes[keyof ISettings] }>
		// setItem: (state, { payload: { key, value } }: PayloadAction<{ key: keyof ISettings; value: unknown }>) => {
		// 	state.settings._settings_time = Date.now()
		// 	state.settings[key] = value as never
		// }
	},
	extraReducers: builder => {
		builder
			// setItem
			.addCase(setItem.pending, (state, action) => {
				const { key, value } = action.meta.arg

				state.settings._settings_time = Date.now()
				state.settings[key] = value as never
			})

			// getSettings
			.addCase(getSettings.pending, state => {
				state.isLoading = true
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
					} else {
						// TODO: window confirm settings actual
						settings = payload.server // Серверные настройки более актуальные
					}

					for (const option in settings) {
						// NOTE: удаляет кастомные настройки (например 'favorites:id:category': {...})
						// if (option in state.settings) {
						state.settings[option as never] = settings[option as never]
						// }
					}
				} else {
					const settings = payload.local ?? payload.server
					if (settings !== null) {
						for (const option in settings) {
							// NOTE: удаляет кастомные настройки (например 'favorites:id:category': {...})
							// if (option in state.settings) {
							state.settings[option as never] = settings[option as never]
							// }
						}
					}
				}
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
				if (!payload.local || !payload.server) {
					console.warn(`Ошибка сохранения настроек: ${payload.server ? 'Local' : 'Server'}`)
				}
			})
	}
})

export const { actions, reducer } = settingsSlice
