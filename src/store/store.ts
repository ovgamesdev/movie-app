import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@store/auth'
import { kinopoiskApi } from '@store/kinopoisk'
import { safeAreaReducer } from '@store/safeArea'
import { settingsReducer } from '@store/settings'
import { updateReducer } from '@store/update'
import { reducer as network } from 'react-native-offline'
import { listenerMiddleware } from './listenerMiddleware'

const reducers = combineReducers({
	auth: authReducer,
	settings: settingsReducer,
	network,
	update: updateReducer,
	[kinopoiskApi.reducerPath]: kinopoiskApi.reducer,
	safeArea: safeAreaReducer
})

export const store = configureStore({
	reducer: reducers,
	devTools: __DEV__,
	middleware: getDefaultMiddleware => getDefaultMiddleware().concat(listenerMiddleware.middleware, kinopoiskApi.middleware) // .prepend(listenerMiddleware.middleware).prepend(kinopoiskApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
