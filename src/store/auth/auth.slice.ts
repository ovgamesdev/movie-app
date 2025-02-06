import { statusCodes } from '@react-native-google-signin/google-signin'
import { createSlice } from '@reduxjs/toolkit'
import { authExtraActions, IInitialStateAuth } from '@store/auth'
import { ToastAndroid } from 'react-native'

const initialState: IInitialStateAuth = {
	user: null,
	isLoading: true,
	isAllScopeAllowed: false
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder

			// getCurrentGoogleUser
			.addCase(authExtraActions.getCurrentGoogleUser.pending, state => {
				state.isLoading = true
			})
			.addCase(authExtraActions.getCurrentGoogleUser.fulfilled, (state, { payload }) => {
				state.user = payload
				state.isLoading = false
				state.isAllScopeAllowed = payload?.scopes.includes('https://www.googleapis.com/auth/drive.appdata') ?? false
			})
			.addCase(authExtraActions.getCurrentGoogleUser.rejected, state => {
				state.user = null
				state.isLoading = false
				state.isAllScopeAllowed = false
			})

			// signInGoogleUser
			.addCase(authExtraActions.signInGoogleUser.pending, state => {
				state.isLoading = true
			})
			.addCase(authExtraActions.signInGoogleUser.fulfilled, (state, { payload }) => {
				state.user = payload
				state.isLoading = false
				state.isAllScopeAllowed = payload?.scopes.includes('https://www.googleapis.com/auth/drive.appdata') ?? false
			})
			.addCase(authExtraActions.signInGoogleUser.rejected, (state, { error: { message } }) => {
				state.user = null
				state.isLoading = false
				state.isAllScopeAllowed = false

				if (message === statusCodes.SIGN_IN_CANCELLED) {
					ToastAndroid.show('Пользователь отменил процесс входа.', ToastAndroid.LONG)
				} else if (message === statusCodes.IN_PROGRESS) {
					ToastAndroid.show('Операция (например, вход) уже выполняется.', ToastAndroid.LONG)
				} else if (message === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
					ToastAndroid.show('Сервисы Google Play недоступны или устарели.', ToastAndroid.LONG)
				} else {
					ToastAndroid.show('Произошла неизвестная ошибка при попытке входа через Google Play Services.', ToastAndroid.LONG)
				}
			})

			// addScopeGoogleUser
			.addCase(authExtraActions.addScopeGoogleUser.pending, state => {
				state.isLoading = true
			})
			.addCase(authExtraActions.addScopeGoogleUser.fulfilled, (state, { payload }) => {
				state.user = payload
				state.isLoading = false
				state.isAllScopeAllowed = payload?.scopes.includes('https://www.googleapis.com/auth/drive.appdata') ?? false
			})
			.addCase(authExtraActions.addScopeGoogleUser.rejected, (state, { error: { message } }) => {
				state.user = null
				state.isLoading = false
				state.isAllScopeAllowed = false

				if (message === statusCodes.SIGN_IN_CANCELLED) {
					ToastAndroid.show('Пользователь отменил процесс входа.', ToastAndroid.LONG)
				} else if (message === statusCodes.IN_PROGRESS) {
					ToastAndroid.show('Операция (например, вход) уже выполняется.', ToastAndroid.LONG)
				} else if (message === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
					ToastAndroid.show('Сервисы Google Play недоступны или устарели.', ToastAndroid.LONG)
				} else {
					ToastAndroid.show('Произошла неизвестная ошибка при попытке входа через Google Play Services.', ToastAndroid.LONG)
				}
			})

			// signOutGoogleUser
			.addCase(authExtraActions.signOutGoogleUser.pending, state => {
				state.isLoading = true
			})
			.addCase(authExtraActions.signOutGoogleUser.fulfilled, (state, { payload }) => {
				state.user = payload
				state.isLoading = false
				state.isAllScopeAllowed = false
			})
			.addCase(authExtraActions.signOutGoogleUser.rejected, state => {
				state.user = null
				state.isLoading = false
				state.isAllScopeAllowed = false

				ToastAndroid.show('Произошла ошибка при выходе из Google Drive.', ToastAndroid.LONG)
			})
	}
})

export const { actions, reducer } = authSlice
