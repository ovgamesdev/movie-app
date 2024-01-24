import { BookmarksTabParamList, TabBar, TabBarTv, navigation } from '@navigation'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FC, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { Favorites, History } from '.'

export const TvBookmarks: FC = () => {
	const Stack = createNativeStackNavigator<BookmarksTabParamList>()
	const [activeTab, setActiveTab] = useState<keyof BookmarksTabParamList>('History')

	return (
		<View style={{ flex: 1 }}>
			<TabBarTv activeTab={activeTab} setActiveTab={tab => navigation.replace(tab)} />
			<Stack.Navigator
				screenListeners={{
					state: e => {
						const name = (e.data as { state?: { routes?: { name: keyof BookmarksTabParamList }[] } } | undefined)?.state?.routes?.[0]?.name

						if (name) {
							setActiveTab(name)
						}
					}
				}}
				screenOptions={{ headerShown: false, freezeOnBlur: true, animation: 'none' }}
				initialRouteName={activeTab}>
				<Stack.Screen name='Favorites' component={Favorites} />
				<Stack.Screen name='History' component={History} />
			</Stack.Navigator>
		</View>
	)
}

export const Bookmarks: FC = () => {
	const Tab = createMaterialTopTabNavigator<BookmarksTabParamList>()

	return (
		<Tab.Navigator initialLayout={Dimensions.get('window')} initialRouteName='History' tabBar={TabBar}>
			<Tab.Screen name='Favorites' component={Favorites} options={{ tabBarLabel: 'Избранное' }} />
			<Tab.Screen name='History' component={History} options={{ tabBarLabel: 'История' }} />
		</Tab.Navigator>
	)
}
