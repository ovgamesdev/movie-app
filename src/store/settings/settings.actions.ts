import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { GDrive, ListQueryBuilder, MimeTypes } from '@robinbobin/react-native-google-drive-api-wrapper'
import { ISettings } from './settings.slice'

const KEY = 'settings'

const onDriveError = (from: string, error: any) => {
	console.error(from, error?.__json?.error ?? error)
}

// createAsyncThunk<ISettings | null>('settings/get-cloud-settings', async (_, thunkAPI) =>
const getCloudSettings = async (): Promise<ISettings | null> => {
	try {
		if (!(await GoogleSignin.isSignedIn())) {
			return null
		}

		const tokens = await GoogleSignin.getTokens()
		const gdrive = new GDrive()
		gdrive.accessToken = tokens.accessToken
		gdrive.fetchTimeout = 15000

		const list = await gdrive.files.list({ spaces: 'appDataFolder', q: new ListQueryBuilder().e('name', KEY) })

		if (list?.files?.length > 0) {
			const data = await gdrive.files.getJson(list.files[0].id)
			return data as ISettings
		} else {
			return null
		}
	} catch (error) {
		onDriveError('getCloudSettings', error)
		return null
	}
}

// createAsyncThunk<object | null>('settings/save-cloud-settings', async (_, thunkAPI) =>
const saveCloudSettings = async (_value: ISettings): Promise<boolean> => {
	try {
		const value = JSON.stringify(_value)

		if (!(await GoogleSignin.isSignedIn())) {
			return false
		}

		const tokens = await GoogleSignin.getTokens()
		const gdrive = new GDrive()
		gdrive.accessToken = tokens.accessToken
		gdrive.fetchTimeout = 15000

		const list = await gdrive.files.list({ spaces: 'appDataFolder', q: new ListQueryBuilder().e('name', KEY) })

		if (list?.files?.length > 0) {
			const file = await gdrive.files.newMultipartUploader().setData(value, MimeTypes.JSON_UTF8).setIdOfFileToUpdate(list.files[0].id).execute()

			return true //file.id as string
		} else {
			const file = await gdrive.files
				.newMultipartUploader()
				.setData(value, MimeTypes.JSON_UTF8)
				.setRequestBody({ name: KEY, parents: ['appDataFolder'] })
				.execute()

			return true //file.id as string
		}
	} catch (error) {
		onDriveError('saveCloudSettings', error)
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

const saveLocalSettings = async (_value: ISettings): Promise<boolean> => {
	try {
		const value = JSON.stringify(_value)

		await AsyncStorage.setItem(KEY, value)
		return true
	} catch (error) {
		console.error('saveLocalSettings', error)
		return false
	}
}

export const getSettings = createAsyncThunk<{ local: ISettings | null; server: ISettings | null }>('settings/get-settings', async () => {
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

export const saveSettings = createAsyncThunk<{ local: boolean; server: boolean }>('settings/save-settings', async (_, thunkAPI) => {
	try {
		const state = thunkAPI.getState() as any
		const settings = (state.settings.settings as ISettings) ?? {}

		return {
			local: await saveLocalSettings(settings),
			server: await saveCloudSettings(settings)
		}
	} catch (error) {
		console.error('saveSettings', error)
		return { local: false, server: false }
	}
})

export const setItem = createAsyncThunk('settings/set-item-settings', async ({ key, value }: { key: keyof ISettings; value: unknown }, thunkAPI) => {
	// TODO https://stackoverflow.com/a/75894898

	thunkAPI.dispatch(saveSettings())

	return { key, value }
})
