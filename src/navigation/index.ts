export * from './StackNavigator'
export * from './TabNavigator'

export type RootStackParamList = {
	Home: undefined
	Movie: { data: { id: number } }
	Watch: { data: { id: number } }
	MovieListSlug: { data: { slug: string } }
}

export type HomeTabParamList = {
	Content: undefined
	Settings: undefined
	Search: undefined | { data: {} }
}
