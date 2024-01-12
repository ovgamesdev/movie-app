import { PowerManagerInfo } from '@notifee/react-native/dist/types/PowerManagerInfo'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { IInitialStateBackgroundRestriction } from '@store/backgroundRestriction'

const initialState: IInitialStateBackgroundRestriction = {
	isVisibleModal: false,
	powerManagerInfo: null,
	isInDontKillMyApp: false
}

const backgroundRestrictionSlice = createSlice({
	name: 'backgroundRestriction',
	initialState,
	reducers: {
		setData: (state: IInitialStateBackgroundRestriction, { payload }: PayloadAction<{ batteryOptimizationEnabled: boolean; powerManagerInfo: PowerManagerInfo; isInDontKillMyApp: boolean }>) => {
			state.isVisibleModal = payload.batteryOptimizationEnabled
			state.isInDontKillMyApp = payload.isInDontKillMyApp
			state.powerManagerInfo = payload.powerManagerInfo
		},
		setIsVisibleBackgroundRestrictionModal: (state, { payload }: PayloadAction<boolean>) => {
			state.isVisibleModal = payload
		}
	}
})

export const { actions, reducer } = backgroundRestrictionSlice
