import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { reducer as network } from 'react-native-offline'
import { getCurrentGoogleUser } from './auth/auth.actions'
import { reducer as authReducer } from './auth/auth.slice'
import { listenerMiddleware } from './listenerMiddleware'
import { reducer as settingsReducer } from './settings/settings.slice'
import { getApkVersion } from './update/update.actions'
import { reducer as updateReducer } from './update/update.slice'

const reducers = combineReducers({
	auth: authReducer,
	settings: settingsReducer,
	network,
	update: updateReducer
})

export const store = configureStore({
	reducer: reducers,
	devTools: __DEV__,
	middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

store.dispatch(dispatch => {
	dispatch(getCurrentGoogleUser())
	dispatch(getApkVersion())
})
