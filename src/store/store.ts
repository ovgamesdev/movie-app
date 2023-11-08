import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { getCurrentGoogleUser } from './auth/auth.actions'
import { reducer as authReducer } from './auth/auth.slice'
import { listenerMiddleware } from './listenerMiddleware'
import { reducer as settingsReducer } from './settings/settings.slice'

const reducers = combineReducers({
	auth: authReducer,
	settings: settingsReducer
})

export const store = configureStore({
	reducer: reducers,
	devTools: __DEV__,
	middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

store.dispatch(dispatch => dispatch(getCurrentGoogleUser()))
