import notifee from '@notifee/react-native'
import { PayloadAction, Unsubscribe, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { AppStartListening } from '@store/listenerMiddleware'
import { IInitialStateNotices, NoticesItem, NotificationType, noticesExtraActions } from '@store/notices'

const COUNT_SAVE_TO_LIMIT = 150

const initialState: IInitialStateNotices = {
	Notices: 0,
	notifications: []
}

const noticesSlice = createSlice({
	name: 'notices',
	initialState,
	reducers: {
		displayNotification: (state: IInitialStateNotices, { payload }: PayloadAction<NotificationType>) => {
			notifee.displayNotification(payload)

			const item: NoticesItem = {
				timestamp: payload.android.timestamp,
				id: payload.id,
				title: payload.title,
				body: payload.body,
				data: payload.data,
				poster: payload.android.largeIcon
			}

			state.notifications = [...state.notifications, item].sort((a, b) => b.timestamp - a.timestamp).slice(0, COUNT_SAVE_TO_LIMIT - 1)
			state.Notices = state.notifications.filter(it => !it.read).length
		},
		// addNotice: (state: IInitialStateNotices, { payload }: PayloadAction<NoticesItem>) => {
		// 	state.notifications = [...state.notifications, payload].sort((a, b) => b.timestamp - a.timestamp).slice(0, COUNT_SAVE_TO_LIMIT - 1)

		// 	state.Notices = state.notifications.filter(it => !it.read).length
		// },
		removeNotice: (state: IInitialStateNotices, { payload }: PayloadAction<NoticesItem>) => {
			// TODO add remove notice
			// data.filter(it => !(it.id === item.id && it.timestamp === item.timestamp))
			//
			// state.notifications = [...state.notifications, payload].sort((a, b) => b.timestamp - a.timestamp).slice(0, COUNT_SAVE_TO_LIMIT - 1)
			// state.Notices = state.notifications.filter(it => !it.read).length
		},
		setReadNotices: (state: IInitialStateNotices) => {
			state.notifications = state.notifications
				.map(it => ({ ...it, read: true }))
				.sort((a, b) => b.timestamp - a.timestamp)
				.slice(0, COUNT_SAVE_TO_LIMIT - 1)

			state.Notices = state.notifications.filter(it => !it.read).length
		}
	},
	extraReducers: builder => {
		builder

			// getNotices
			.addCase(noticesExtraActions.getNotices.fulfilled, (state, { payload }) => {
				state.notifications = payload.sort((a, b) => b.timestamp - a.timestamp)

				state.Notices = state.notifications.filter(it => !it.read).length
			})
	}
})

export const { actions, reducer } = noticesSlice

export const setupNoticesListeners = (startListening: AppStartListening): Unsubscribe =>
	startListening({
		matcher: isAnyOf(actions.displayNotification, actions.removeNotice, actions.setReadNotices),
		effect: async (action, listenerApi) => {
			// TODO to save sort and limit
			listenerApi.dispatch(noticesExtraActions.saveNotices())
		}
	})
