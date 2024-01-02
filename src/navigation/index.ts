import { createNavigationContainerRef } from '@react-navigation/native'
import { IListSlugFilter, IMainTrailer, MovieType } from '@store/kinopoisk'
import { WatchHistoryProvider } from '@store/settings'

export * from './StackNavigator'
export * from './TabBar'
export * from './TabNavigator'

type ParamList = RootStackParamList & HomeTabParamList & BookmarksTabParamList
type NavigateType<RouteName extends keyof ParamList> = RouteName extends unknown ? (undefined extends ParamList[RouteName] ? [screen: RouteName] | [screen: RouteName, params: ParamList[RouteName]] : [screen: RouteName, params: ParamList[RouteName]]) : never

export const navigationRef = createNavigationContainerRef<ParamList>()
export const navigation = {
	// from StackActions
	replace: <RouteName extends keyof ParamList>(...args: NavigateType<RouteName>) => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch({ type: 'REPLACE', payload: { name: args[0], params: args[1] } })
		}
	},
	push: <RouteName extends keyof ParamList>(...args: NavigateType<RouteName>) => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch({ type: 'PUSH', payload: { name: args[0], params: args[1] } })
		}
	},
	pop: (count: number = 1) => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch({ type: 'POP', payload: { count } })
		}
	},
	popToTop: () => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch({ type: 'POP_TO_TOP' })
		}
	},
	navigate: <RouteName extends keyof ParamList>(...args: NavigateType<RouteName>) => {
		if (navigationRef.isReady()) {
			navigationRef.navigate(...args)
		}
	}
}

export type RootStackParamList = {
	Home: undefined
	Movie: { data: { id: number; type: MovieType } }
	MovieTrailer: { data: IMainTrailer }
	Person: { data: { id: number } }
	Watch: { data: { id: number; type: MovieType; title: string; poster: string | null; year: number | null; provider: WatchHistoryProvider | null } }
	MovieListSlug: { data: { slug: string; filters?: IListSlugFilter } }
}

export type HomeTabParamList = {
	Content: undefined
	Settings: undefined
	Search: undefined | { data: object }
	Bookmarks: undefined
}

export type BookmarksTabParamList = {
	Favorites: undefined
	History: undefined
}
