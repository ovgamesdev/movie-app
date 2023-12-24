import { createNavigationContainerRef } from '@react-navigation/native'
import { IListSlugFilter, IMainTrailer, MovieType } from '@store/kinopoisk'

export * from './StackNavigator'
export * from './TabBar'
export * from './TabNavigator'

export const navigationRef = createNavigationContainerRef<RootStackParamList>()

export type RootStackParamList = {
	Home: undefined
	Movie: { data: { id: number; type: MovieType } }
	MovieTrailer: { data: IMainTrailer }
	Person: { data: { id: number } }
	Watch: { data: { id: number; type: MovieType; title: string; poster: string | null; year: number | null; provider: 'provider' } }
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
