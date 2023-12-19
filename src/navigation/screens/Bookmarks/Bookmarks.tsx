import { useTheme } from '@hooks'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import React from 'react'
import { Dimensions, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Tab = createMaterialTopTabNavigator()

const Favorites = () => {
	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
				<View style={{ flexDirection: 'row', padding: 10, paddingBottom: 5, paddingTop: 10, gap: 20 }}>
					<Text>Favorites</Text>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
const History = () => {
	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
				<View style={{ padding: 10, paddingBottom: 5, paddingTop: 10, gap: 20 }}>
					<Text>History</Text>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}

export const Bookmarks = () => {
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	return (
		<Tab.Navigator
			initialLayout={Dimensions.get('window')}
			initialRouteName='History'
			screenOptions={{
				tabBarIndicatorStyle: { backgroundColor: colors.accent100 },
				tabBarStyle: { marginTop: insets.top },
				tabBarLabelStyle: { fontSize: 14 },
				tabBarActiveTintColor: colors.text100,
				tabBarInactiveTintColor: colors.text200
			}}>
			<Tab.Screen name='Favorites' component={Favorites} options={{ tabBarLabel: 'Избранное' }} />
			<Tab.Screen name='History' component={History} options={{ tabBarLabel: 'История' }} />
		</Tab.Navigator>
	)
}
