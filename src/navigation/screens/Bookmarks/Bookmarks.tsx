import { Button, ImageBackground } from '@components/atoms'
import { IContentReleaseNotifyMovie, useNavigation, useTheme } from '@hooks'
import { BookmarksTabParamList } from '@navigation'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useFocusEffect } from '@react-navigation/native'
import { normalizeUrlWithNull } from '@utils'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Platform, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { TabBar } from '../../TabBar'

const Tab = createMaterialTopTabNavigator<BookmarksTabParamList>()

const Favorites = () => {
	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight>
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

	const ref = useRef<FlatList>(null)
	const focusedItem = useRef<{ index: number }>({ index: -1 })
	const [refreshFocusedItem, setRefreshFocusedItem] = useState({ focus: { index: -1 }, blur: { index: -1 } })

	useFocusEffect(
		useCallback(() => {
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
	)

	useEffect(() => {
		if (!Platform.isTV) return

		const listenerFocus = navigation.addListener('focus', () => setRefreshFocusedItem(it => ({ focus: it.blur, blur: { index: -1 } })))
		const listenerBlur = navigation.addListener('blur', () => setRefreshFocusedItem({ focus: { index: -1 }, blur: focusedItem.current }))

		return () => {
			listenerFocus()
			listenerBlur()
		}
	}, [focusedItem.current, navigation])

	const handleOnFocus = ({ index }: { index: number }) => {
		if (index < data.length) {
			ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
		}

		focusedItem.current = { index }
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} autoFocus trapFocusLeft trapFocusRight>
			<FlatList
				ref={ref}
				data={data}
				renderItem={({ item, index }) => {
					const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

					return (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: colors.bg300 }} />}
							<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onFocus={() => handleOnFocus({ index })} onBlur={handleOnBlur} onPress={() => navigation.push('Movie', { data: item })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index}>
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
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
				<View style={{ flexDirection: 'row', padding: 10, paddingBottom: 5, paddingTop: 10, gap: 20 }}>
					<Text>History</Text>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}

export const Bookmarks = () => {
	// TODO other navigator for tv

	return (
		<Tab.Navigator initialLayout={Dimensions.get('window')} initialRouteName='ReleaseNotify' tabBar={TabBar}>
			<Tab.Screen name='Favorites' component={Favorites} options={{ tabBarLabel: 'Избранное' }} />
			<Tab.Screen name='ReleaseNotify' component={ReleaseNotify} options={{ tabBarLabel: 'Уведомить о выходе' }} />
			<Tab.Screen name='History' component={History} options={{ tabBarLabel: 'История' }} />
		</Tab.Navigator>
	)
}
