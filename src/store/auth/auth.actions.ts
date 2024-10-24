import { GoogleSignin, isErrorWithCode, statusCodes, User } from '@react-native-google-signin/google-signin'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { settingsExtraActions } from '@store/settings'
import { Alert } from 'react-native'
import { AppDispatch, RootState } from '../store'

const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState
	dispatch: AppDispatch
}>()

export const getCurrentGoogleUser = createAppAsyncThunk('auth/get-google-user', async (_, thunkAPI) => {
	try {
		const { type, data } = await GoogleSignin.signInSilently()

		thunkAPI.dispatch(settingsExtraActions.getSettings())

		if (type === 'success') {
			return data
		}
		return null
	} catch (error: any) {
		console.error(`getCurrentGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})

export const signInGoogleUser = createAppAsyncThunk<User | null>('auth/sign-in-google-user', async (_, thunkAPI) => {
	try {
		await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
		const { data } = await GoogleSignin.signIn()

		thunkAPI.dispatch(settingsExtraActions.getSettings())

		return data
	} catch (error: any) {
		console.error(`signInGoogleUser`, { ...error })
		if (isErrorWithCode(error)) {
			thunkAPI.abort(error.code)
			if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				Alert.alert('play services not available or outdated')
			}
		} else {
			thunkAPI.abort()
		}
		return null
	}
})

export const addScopeGoogleUser = createAppAsyncThunk<User | null>('auth/add-scope-google-user', async (_, thunkAPI) => {
	try {
		await GoogleSignin.addScopes({
			scopes: ['https://www.googleapis.com/auth/drive.appdata']
		})

		const { data } = await GoogleSignin.signInSilently()

		thunkAPI.dispatch(settingsExtraActions.getSettings())

		return data
	} catch (error: any) {
		console.error(`addScopeGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})

export const signOutGoogleUser = createAppAsyncThunk<null>('auth/sign-out-google-user', async (_, thunkAPI) => {
	try {
		// await GoogleSignin.revokeAccess() // TODO add other buttoh with accept
		await GoogleSignin.signOut()
		return null
	} catch (error: any) {
		console.error(`signOutGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})
