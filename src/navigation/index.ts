export * from './StackNavigator'
export * from './TabNavigator'

export type RootStackParamList = {
	Home: undefined
	Movie: { id: number }
}

export type HomeTabParamList = {
	Content: undefined
	Settings: undefined
}
