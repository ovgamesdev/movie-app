import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { IInitialStateSafeArea } from './safeArea.types'

const initialState: IInitialStateSafeArea = {
	isShowNetInfo: false
}

const safeAreaSlice = createSlice({
	name: 'safeArea',
	initialState,
	reducers: {
		setIsShowNetInfo: (state: IInitialStateSafeArea, { payload }: PayloadAction<boolean>) => {
			state.isShowNetInfo = payload
		}
	}
})

export const { actions, reducer } = safeAreaSlice
