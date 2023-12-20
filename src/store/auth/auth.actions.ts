import { GoogleSignin, User } from '@react-native-google-signin/google-signin'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { settingsExtraActions } from '@store/settings'
import { AppDispatch, RootState } from '../store'

const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState
	dispatch: AppDispatch
}>()

export const getCurrentGoogleUser = createAppAsyncThunk('auth/get-google-user', async (_, thunkAPI) => {
	try {
		const isSignedIn = await GoogleSignin.isSignedIn()

		thunkAPI.dispatch(settingsExtraActions.getSettings())

		if (isSignedIn) {
			let userInfo = await GoogleSignin.getCurrentUser()
			if (userInfo === null) {
				userInfo = await GoogleSignin.signInSilently()
			}

			return userInfo
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
		const userInfo = await GoogleSignin.signIn()

		thunkAPI.dispatch(settingsExtraActions.getSettings())

		return userInfo
	} catch (error: any) {
		console.error(`signInGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})

export const addScopeGoogleUser = createAppAsyncThunk<User | null>('auth/add-scope-google-user', async (_, thunkAPI) => {
	try {
		const userInfo = await GoogleSignin.addScopes({
			scopes: ['https://www.googleapis.com/auth/drive.appdata']
		})

		thunkAPI.dispatch(settingsExtraActions.getSettings())

		return userInfo
	} catch (error: any) {
		console.error(`addScopeGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})

export const signOutGoogleUser = createAppAsyncThunk<null>('auth/sign-out-google-user', async (_, thunkAPI) => {
	try {
		const userInfo = await GoogleSignin.signOut()
		return userInfo
	} catch (error: any) {
		console.error(`signOutGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})
