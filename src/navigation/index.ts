import { IListSlugFilter } from 'src/store/kinopoisk/kinopoisk.types'

export * from './StackNavigator'
export * from './TabNavigator'

export type RootStackParamList = {
	Home: undefined
	Movie: { data: { id: number; type: 'Film' | 'TvSeries' | 'MiniSeries' } }
	Person: { data: { id: number } }
	Watch: { data: { id: number } }
	MovieListSlug: { data: { slug: string; filters?: IListSlugFilter } }
}

export type HomeTabParamList = {
	Content: undefined
	Settings: undefined
	Search: undefined | { data: object }
}
