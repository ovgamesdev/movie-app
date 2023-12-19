import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { GDrive, ListQueryBuilder, MimeTypes } from '@robinbobin/react-native-google-drive-api-wrapper'
import { AppDispatch, RootState } from '../store'
import { ISettings } from './settings.types'

const KEY = 'settings'

const drive: { fileId: string; accessToken: string } = { fileId: '', accessToken: '' }

const getCloudSettings = async (): Promise<ISettings | null> => {
	try {
		if (!(await GoogleSignin.isSignedIn())) {
			return null
		}

		if (drive.accessToken.length === 0) {
			drive.accessToken = (await GoogleSignin.getTokens()).accessToken
		}

		const gdrive = new GDrive()
		gdrive.accessToken = drive.accessToken
		gdrive.fetchTimeout = 15000

		if (drive.fileId.length === 0) {
			const list = await gdrive.files.list({ spaces: 'appDataFolder', q: new ListQueryBuilder().e('name', KEY) })
			if (list?.files?.length > 0) {
				drive.fileId = list.files[0].id
			}
		}

		if (drive.fileId.length > 0) {
			return (await gdrive.files.getJson(drive.fileId)) as ISettings
		} else {
			return null
		}
	} catch (error: any) {
		console.error('getCloudSettings', { ...error })
		// TODO ???
		try {
			if (error?.__json?.error?.code === 401) {
				await GoogleSignin.clearCachedAccessToken(drive.accessToken)
				drive.accessToken = (await GoogleSignin.getTokens()).accessToken

				return await getCloudSettings()
			}
		} catch (error2) {
			console.error('getCloudSettings refreshToken', error2)
			return null
		}
		return null
	}
}

const saveCloudSettings = async (_value: object): Promise<boolean> => {
	try {
		const value = JSON.stringify(_value)

		if (!(await GoogleSignin.isSignedIn())) {
			return false
		}

		if (drive.accessToken.length === 0) {
			drive.accessToken = (await GoogleSignin.getTokens()).accessToken
		}

		const gdrive = new GDrive()
		gdrive.accessToken = drive.accessToken
		gdrive.fetchTimeout = 15000

		if (drive.fileId.length === 0) {
			const list = await gdrive.files.list({ spaces: 'appDataFolder', q: new ListQueryBuilder().e('name', KEY) })
			if (list?.files?.length > 0) {
				drive.fileId = list.files[0].id
			}
		}

		if (drive.fileId.length > 0) {
			const file = await gdrive.files.newMultipartUploader().setData(value, MimeTypes.JSON_UTF8).setIdOfFileToUpdate(drive.fileId).execute()

			drive.fileId = file.id
			return true
		} else {
			const file = await gdrive.files
				.newMultipartUploader()
				.setData(value, MimeTypes.JSON_UTF8)
				.setRequestBody({ name: KEY, parents: ['appDataFolder'] })
				.execute()

			drive.fileId = file.id
			return true
		}
	} catch (error: any) {
		console.error('saveCloudSettings', { ...error })
		//  /*
		//  	{
		//  		"__json": {
		//  			"error": {
		//  					"code": 401,
		//  					"message": "Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.",
		//  					"errors": [
		//  							{
		//  									"message": "Invalid Credentials",
		//  									"domain": "global",
		//  									"reason": "authError",
		//  									"location": "Authorization",
		//  									"locationType": "header"
		//  							}
		//  					],
		//  					"status": "UNAUTHENTICATED"
		//  			}
		//  		}
		//  	}
		//  */

		// TODO ???
		try {
			if (error?.__json?.error?.code === 401) {
				await GoogleSignin.clearCachedAccessToken(drive.accessToken)
				drive.accessToken = (await GoogleSignin.getTokens()).accessToken

				return await saveCloudSettings(_value)
			}
		} catch (error2) {
			console.error('saveCloudSettings refreshToken', error2)
			return false
		}
		return false
	}
}

const getLocalSettings = async (): Promise<ISettings | null> => {
	try {
		const storedSettings = await AsyncStorage.getItem(KEY)

		if (storedSettings != null) {
			return JSON.parse(storedSettings)
		} else {
			return null
		}
	} catch (error) {
		console.error('getLocalSettings', error)
		return null
	}
}

const saveLocalSettings = async (_value: object): Promise<boolean> => {
	try {
		const value = JSON.stringify(_value)

		await AsyncStorage.setItem(KEY, value)
		return true
	} catch (error) {
		console.error('saveLocalSettings', error)
		return false
	}
}

const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState
	dispatch: AppDispatch
}>()

export const getSettings = createAppAsyncThunk<{ local: ISettings | null; server: ISettings | null }>('settings/get-settings', async () => {
	try {
		return {
			local: await getLocalSettings(),
			server: await getCloudSettings()
		}
	} catch (error) {
		console.error('getSettings', error)
		return { local: null, server: null }
	}
})

export const saveSettings = createAppAsyncThunk<{ local: boolean; server: boolean }>('settings/save-settings', async (_, thunkAPI) => {
	try {
		const state = thunkAPI.getState()
		const settings = (state.settings.settings as ISettings | null) ?? {}

		return {
			local: await saveLocalSettings(settings),
			server: await saveCloudSettings(settings)
		}
	} catch (error) {
		console.error('saveSettings', error)
		return { local: false, server: false }
	}
})
