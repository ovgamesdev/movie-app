import { User, statusCodes } from '@react-native-google-signin/google-signin'
import { createSlice } from '@reduxjs/toolkit'
import { ToastAndroid } from 'react-native'
import { addScopeGoogleUser, getCurrentGoogleUser, signInGoogleUser, signOutGoogleUser } from './auth.actions'

interface IInitialStateAuth {
	user: User | null
	isLoading: boolean
	isAllScopeAllowed: boolean
}

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
			.addCase(getCurrentGoogleUser.pending, state => {
				state.isLoading = true
			})
			.addCase(getCurrentGoogleUser.fulfilled, (state, { payload }) => {
				state.user = payload
				state.isLoading = false
				state.isAllScopeAllowed = payload?.scopes?.includes('https://www.googleapis.com/auth/drive.appdata') ?? false
			})
			.addCase(getCurrentGoogleUser.rejected, state => {
				state.user = null
				state.isLoading = false
				state.isAllScopeAllowed = false
			})

			// signInGoogleUser
			.addCase(signInGoogleUser.pending, state => {
				state.isLoading = true
			})
			.addCase(signInGoogleUser.fulfilled, (state, { payload }) => {
				state.user = payload
				state.isLoading = false
				state.isAllScopeAllowed = payload?.scopes?.includes('https://www.googleapis.com/auth/drive.appdata') ?? false
			})
			.addCase(signInGoogleUser.rejected, (state, { error: { message } }) => {
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
			.addCase(addScopeGoogleUser.pending, state => {
				state.isLoading = true
			})
			.addCase(addScopeGoogleUser.fulfilled, (state, { payload }) => {
				state.user = payload
				state.isLoading = false
				state.isAllScopeAllowed = payload?.scopes?.includes('https://www.googleapis.com/auth/drive.appdata') ?? false
			})
			.addCase(addScopeGoogleUser.rejected, (state, { error: { message } }) => {
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
			.addCase(signOutGoogleUser.pending, state => {
				state.isLoading = true
			})
			.addCase(signOutGoogleUser.fulfilled, (state, { payload }) => {
				state.user = payload
				state.isLoading = false
				state.isAllScopeAllowed = false
			})
			.addCase(signOutGoogleUser.rejected, state => {
				state.user = null
				state.isLoading = false
				state.isAllScopeAllowed = false

				ToastAndroid.show('Произошла ошибка при выходе из Google Drive.', ToastAndroid.LONG)
			})
	}
})

export const { actions, reducer } = authSlice
