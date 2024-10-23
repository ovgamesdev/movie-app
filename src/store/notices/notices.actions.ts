import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { NoticesItem } from '@store/notices'
import { AppDispatch, RootState } from '../store'

const KEY = 'displayNotification'

const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState
	dispatch: AppDispatch
}>()

export const getNotices = createAppAsyncThunk<NoticesItem[]>('notices/get-notices', async () => {
	try {
		const storedNotices = await AsyncStorage.getItem(KEY)

		if (storedNotices != null) {
			return JSON.parse(storedNotices)
		} else {
			return []
		}
	} catch (error) {
		console.error('getNotices', error)
		return []
	}
})

export const saveNotices = createAppAsyncThunk<boolean>('notices/save-notices', async (_, thunkAPI) => {
	try {
		const notifications = thunkAPI.getState().notices.notifications
		const value = JSON.stringify(notifications)

		await AsyncStorage.setItem(KEY, value)
		return true
	} catch (error) {
		console.error('saveNotices', error)
		return false
	}
})
