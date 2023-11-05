import { GoogleSignin, User } from '@react-native-google-signin/google-signin'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { getSettings } from '../settings/settings.actions'

export const getCurrentGoogleUser = createAsyncThunk<User | null>('auth/get-google-user', async (_, thunkAPI) => {
	try {
		const isSignedIn = await GoogleSignin.isSignedIn()

		thunkAPI.dispatch(getSettings())

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

export const signInGoogleUser = createAsyncThunk<User | null>('auth/sign-in-google-user', async (_, thunkAPI) => {
	try {
		await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
		const userInfo = await GoogleSignin.signIn()

		thunkAPI.dispatch(getSettings())

		return userInfo
	} catch (error: any) {
		console.error(`signInGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})

export const addScopeGoogleUser = createAsyncThunk<User | null>('auth/add-scope-google-user', async (_, thunkAPI) => {
	try {
		const userInfo = await GoogleSignin.addScopes({
			scopes: ['https://www.googleapis.com/auth/drive.appdata']
		})

		thunkAPI.dispatch(getSettings())

		return userInfo
	} catch (error: any) {
		console.error(`addScopeGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})

export const signOutGoogleUser = createAsyncThunk<null>('auth/sign-out-google-user', async (_, thunkAPI) => {
	try {
		const userInfo = await GoogleSignin.signOut()
		return userInfo
	} catch (error: any) {
		console.error(`signOutGoogleUser`, { ...error })
		thunkAPI.abort(error.code)
		return null
	}
})
