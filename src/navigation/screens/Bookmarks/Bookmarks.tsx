import { Button, ImageBackground } from '@components/atoms'
import { IContentReleaseNotifyMovie, useNavigation, useTheme } from '@hooks'
import { BookmarksTabParamList } from '@navigation'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { normalizeUrlWithNull } from '@utils'
import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Tab = createMaterialTopTabNavigator<BookmarksTabParamList>()

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
const ReleaseNotify = () => {
	const [data, setData] = useState<IContentReleaseNotifyMovie[]>([])
	const { colors } = useTheme()
	const navigation = useNavigation()

	useEffect(() => {
		const init = async () => {
			const data = await AsyncStorage.getItem('contentReleaseNotify')
			if (data === null) return

			try {
				const parsedData = JSON.parse(data)
				const arrayData: IContentReleaseNotifyMovie[] = Object.values(parsedData)

				console.log('data:', arrayData)
				setData(arrayData)
			} catch (e) {
				console.error(e)
			}
		}

		init()
	}, [])

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<FlatList
				data={data}
				renderItem={({ item, index }) => {
					const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

					return (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: colors.bg300 }} />}
							<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onPress={() => navigation.push('Movie', { data: item })}>
								<ImageBackground source={{ uri: poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6} />
								<View style={{ marginLeft: 20, flex: 1, minHeight: 92 }}>
									<Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: colors.text100, marginBottom: 4 }} numberOfLines={2}>
										{item.name}
									</Text>
									{'productionYear' in item && item.productionYear !== null && (
										<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: colors.text200 }} numberOfLines={1}>
											{item.productionYear}
										</Text>
									)}
								</View>
							</Button>
						</>
					)
				}}
				contentContainerStyle={{ padding: 10, paddingBottom: 5, paddingTop: 10 }}
			/>
		</TVFocusGuideView>
	)
}
const History = () => {
	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
				<View style={{ flexDirection: 'row', padding: 10, paddingBottom: 5, paddingTop: 10, gap: 20 }}>
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
			initialRouteName='ReleaseNotify'
			screenOptions={{
				tabBarIndicatorStyle: { backgroundColor: colors.accent100 },
				tabBarStyle: { marginTop: insets.top },
				tabBarLabelStyle: { fontSize: 14 },
				tabBarActiveTintColor: colors.text100,
				tabBarInactiveTintColor: colors.text200
			}}>
			<Tab.Screen name='Favorites' component={Favorites} options={{ tabBarLabel: 'Избранное' }} />
			<Tab.Screen name='ReleaseNotify' component={ReleaseNotify} options={{ tabBarLabel: 'Уведомить о выходе' }} />
			<Tab.Screen name='History' component={History} options={{ tabBarLabel: 'История' }} />
		</Tab.Navigator>
	)
}
