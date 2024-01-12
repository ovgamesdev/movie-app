import notifee from '@notifee/react-native'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { backgroundRestrictionActions } from '.'
import { AppDispatch, RootState } from '../store'

const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState
	dispatch: AppDispatch
}>()

const isInDontKillMyApp = async (manufacturer: string | null): Promise<boolean> => {
	if (!manufacturer) return false

	try {
		const response = await fetch(`https://dontkillmyapp.com/api/v2/${manufacturer.toLocaleLowerCase()}.json`)
		return response.ok
	} catch (e) {
		console.error(e)
		return false
	}
}

export const isBatteryOptimizationEnabled = createAppAsyncThunk('backgroundRestriction/checkIsBatteryOptimization', async (_, thunkAPI) => {
	const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled()
	if (!batteryOptimizationEnabled) {
		return
	}

	const powerManagerInfo = await notifee.getPowerManagerInfo()
	const inDontKillMyApp = await isInDontKillMyApp(powerManagerInfo.manufacturer ?? null)

	thunkAPI.dispatch(backgroundRestrictionActions.setData({ batteryOptimizationEnabled, powerManagerInfo, isInDontKillMyApp: inDontKillMyApp }))
})
