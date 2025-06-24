import { NavigatorScreenParams, createNavigationContainerRef } from '@react-navigation/native'
import { IListSlugFilter, IMainTrailer, MovieType } from '@store/kinopoisk'
import { WatchHistory, WatchHistoryProvider } from '@store/settings'

export * from './StackNavigator'
export * from './TabBar'
export * from './TabBarTv'
export * from './TabNavigator'

type ParamList = RootStackParamList & HomeTabParamList & BookmarksTabParamList & SettingsTabParamList
type NavigateType<RouteName extends keyof ParamList> = RouteName extends unknown ? (undefined extends ParamList[RouteName] ? [screen: RouteName] | [screen: RouteName, params: ParamList[RouteName]] : [screen: RouteName, params: ParamList[RouteName]]) : never

export type NavigationType = {
	[RouteName in keyof ParamList]: NavigateType<RouteName>
}[keyof ParamList]

export const navigationRef = createNavigationContainerRef<ParamList>()
export const navigation = {
	// from StackActions
	replace: <RouteName extends keyof ParamList>(...args: NavigateType<RouteName>) => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch({ type: 'REPLACE', payload: { name: args[0], params: args[1] } })
		} else {
			console.log('navigation.replace (NOT READY)', args)
		}
	},
	push: <RouteName extends keyof ParamList>(...args: NavigateType<RouteName>) => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch({ type: 'PUSH', payload: { name: args[0], params: args[1] } })
		} else {
			console.log('navigation.push (NOT READY)', args)
		}
	},
	pop: (count: number = 1) => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch({ type: 'POP', payload: { count } })
		} else {
			console.log('navigation.pop (NOT READY)', count)
		}
	},
	popToTop: () => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch({ type: 'POP_TO_TOP' })
		} else {
			console.log('navigation.popToTop (NOT READY)')
		}
	},
	navigate: <RouteName extends keyof ParamList>(...args: NavigateType<RouteName>) => {
		if (navigationRef.isReady()) {
			navigationRef.navigate(...args)
		} else {
			console.log('navigation.navigate (NOT READY)', args)
		}
	},
	goBack: () => {
		if (navigationRef.isReady() && navigationRef.canGoBack()) {
			navigationRef.goBack()
		} else {
			console.log('navigation.goBack (NOT READY OR NOT ABLE TO GO BACK)')
		}
	}
}

export type RootStackParamList = {
	Home: undefined
	Movie: { data: { id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`; type: MovieType }; other?: { title: string; poster: string | null; year: number | null } }
	MovieTrailer: { data: IMainTrailer }
	Person: { data: { id: number } }
	Watch: { data: { id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`; type: MovieType } | { id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`; type: MovieType; title: string; poster: string | null; year: number | null; provider: WatchHistoryProvider | null } }
	MovieListSlug: { data: { slug: string; filters?: IListSlugFilter } }
	Episodes: { data: { id: number; type: MovieType; tmdb_id: number } }

	ItemMenuModal: { data: WatchHistory; lookAtHistory?: number }
	ChangeFilm: { data: { id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}` }; other?: { type: MovieType; title: string; poster: string | null; year: number | null } }
}

export type HomeTabParamList = {
	Content: undefined
	Settings: undefined
	Notices: undefined
	Search: undefined | { data: object }
	Bookmarks: NavigatorScreenParams<BookmarksTabParamList>
}

export type BookmarksTabParamList = {
	Favorites: undefined
	History: undefined | { scrollToItem: WatchHistory; lookAtHistory: number }
}

export type SettingsTabParamList = {
	SettingsHome: undefined
	Logs: undefined
	Backup: undefined
}
