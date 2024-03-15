import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@store/auth'
import { kinopoiskApi } from '@store/kinopoisk'
import { safeAreaReducer } from '@store/safeArea'
import { settingsReducer } from '@store/settings'
import { themoviedbApi } from '@store/themoviedb'
import { updateReducer } from '@store/update'
import { reducer as network } from 'react-native-offline'
import reactotron from '../../ReactotronConfig'
import { backgroundRestrictionReducer } from './backgroundRestriction'
import { itemMenuModalReducer } from './itemMenuModal'
import { listenerMiddleware } from './listenerMiddleware'

const reducers = combineReducers({
	auth: authReducer,
	settings: settingsReducer,
	network,
	update: updateReducer,
	[kinopoiskApi.reducerPath]: kinopoiskApi.reducer,
	[themoviedbApi.reducerPath]: themoviedbApi.reducer,
	safeArea: safeAreaReducer,
	backgroundRestriction: backgroundRestrictionReducer,
	itemMenuModal: itemMenuModalReducer
})

export const store = configureStore({
	reducer: reducers,
	devTools: __DEV__,
	middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }).concat(listenerMiddleware.middleware, kinopoiskApi.middleware, themoviedbApi.middleware),
	enhancers: __DEV__ ? [reactotron.createEnhancer()] : []
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
