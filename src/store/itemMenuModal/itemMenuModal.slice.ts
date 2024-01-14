import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { IInitialStateItemMenuModal } from '@store/itemMenuModal'
import { WatchHistory } from '@store/settings'

const initialState: IInitialStateItemMenuModal = {
	isVisibleModal: false,
	item: null
}

const itemMenuModalSlice = createSlice({
	name: 'itemMenuModal',
	initialState,
	reducers: {
		setItemVisibleModal: (state: IInitialStateItemMenuModal, { payload }: PayloadAction<{ item: WatchHistory }>) => {
			state.isVisibleModal = true
			state.item = payload.item
		},
		setItemHiddenModal: (state: IInitialStateItemMenuModal) => {
			state.isVisibleModal = false
		}
	}
})

export const { actions, reducer } = itemMenuModalSlice
