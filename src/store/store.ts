import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { getCurrentGoogleUser } from './auth/auth.actions'
import { reducer as authReducer } from './auth/auth.slice'
import { reducer as settingsReducer } from './settings/settings.slice'

const reducers = combineReducers({
	auth: authReducer,
	settings: settingsReducer
})

export const store = configureStore({
	reducer: reducers
})

export type RootState = ReturnType<typeof store.getState>

store.dispatch(dispatch => {
	dispatch(getCurrentGoogleUser())
})
