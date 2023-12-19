import { createNavigationContainerRef } from '@react-navigation/native'
import { IListSlugFilter, IMainTrailer } from 'src/store/kinopoisk/kinopoisk.types'

export * from './StackNavigator'
export * from './TabNavigator'

export const navigationRef = createNavigationContainerRef<RootStackParamList>()

export type RootStackParamList = {
	Home: undefined
	Movie: { data: { id: number; type: 'Film' | 'TvSeries' | 'MiniSeries' } }
	MovieTrailer: { data: IMainTrailer }
	Person: { data: { id: number } }
	Watch: { data: { id: number } }
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
	ReleaseNotify: undefined
	History: undefined
}
