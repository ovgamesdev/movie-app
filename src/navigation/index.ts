export * from './StackNavigator'
export * from './TabNavigator'

export type RootStackParamList = {
	Home: undefined
	Movie: { data: { id: number } }
	Watch: { data: { id: number } }
}

export type HomeTabParamList = {
	Content: undefined
	Settings: undefined
}
