import { Button, FocusableFlatList, ImageBackground, Progress } from '@components/atoms'
import { Filters } from '@components/molecules'
import { IContentReleaseNotifyMovie, useNavigation, useTheme, useTypedSelector } from '@hooks'
import { BookmarksTabParamList, TabBar, navigationRef } from '@navigation'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { StackActions, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { WatchHistoryStatus } from '@store/settings'
import { getNoun, normalizeUrlWithNull } from '@utils'
import React, { useCallback, useState } from 'react'
import { Animated, Dimensions, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Favorites: React.FC = () => {
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
const ReleaseNotify: React.FC = () => {
	const [data, setData] = useState<IContentReleaseNotifyMovie[]>([])
	const { colors } = useTheme()
	const navigation = useNavigation()

	// TODO move to settings
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

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} autoFocus trapFocusLeft trapFocusRight>
			<FocusableFlatList
				data={data}
				renderItem={({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
					const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

					return (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: colors.bg300 }} />}
							<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onFocus={onFocus} onBlur={onBlur} onPress={() => navigation.push('Movie', { data: item })} hasTVPreferredFocus={hasTVPreferredFocus}>
								<ImageBackground source={{ uri: poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6} />
								<View style={{ marginLeft: 20, flex: 1, minHeight: 92 }}>
									<Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: colors.text100, marginBottom: 4 }} numberOfLines={2}>
										{item.title}
									</Text>
									{item.year !== null && (
										<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: colors.text200 }} numberOfLines={1}>
											{item.year}
										</Text>
									)}
								</View>
							</Button>
						</>
					)
				}}
				contentContainerStyle={{ padding: 10, paddingBottom: 0, paddingTop: 0 }}
				// stickyHeaderIndices={[0]}
				// stickyHeaderHiddenOnScroll
				// ListHeaderComponent={
				// 	<View style={{ height: 100, backgroundColor: 'red' }}>
				// 		<View style={{}}>
				// 			<Text>1</Text>
				// 			<Text>2</Text>
				// 		</View>
				// 	</View>
				// }
			/>
		</TVFocusGuideView>
	)
}
const filters: Record<'all' | WatchHistoryStatus, string> = { all: 'Все', watch: 'Смотрю', pause: 'Пауза', end: 'Просмотрено' }
const History: React.FC = () => {
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const { colors } = useTheme()
	const navigation = useNavigation()

	const [activeFilter, setActiveFilter] = useState<'all' | WatchHistoryStatus>('all')

	const data = Object.values(watchHistory)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => (activeFilter === 'all' ? it : it.status === activeFilter))
	const barHeight = bottomTabBarHeight - insets.bottom + 2

	const scrollY = new Animated.Value(0)

	console.log('History data:', data)

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight>
			<Filters filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} scrollY={scrollY} />

			<FocusableFlatList
				data={data}
				renderItem={({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
					const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

					return (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: colors.bg300 }} />}
							<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onFocus={onFocus} onBlur={onBlur} onPress={() => navigation.push('Watch', { data: item })} hasTVPreferredFocus={hasTVPreferredFocus}>
								<ImageBackground source={{ uri: poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6} />
								<View style={{ marginLeft: 20, flex: 1, minHeight: 92, maxHeight: 120 }}>
									<Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: colors.text100, marginBottom: 4 }} numberOfLines={2}>
										{item.title}
									</Text>
									{item.year !== null && (
										<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: colors.text200 }} numberOfLines={1}>
											{item.year}
										</Text>
									)}

									{item.duration && item.lastTime && (
										<View style={{ justifyContent: 'flex-end', flex: 1, marginBottom: 8, marginRight: 10 }}>
											<Text style={{ color: colors.text200, fontSize: 14, marginBottom: 4 }}>{item.status === 'end' ? 'Просмотрено' : item.status === 'pause' ? 'Пауза' : `Осталось ${item.duration - item.lastTime} ${getNoun(item.duration - item.lastTime, 'минута', 'минуты', 'минут')}`}</Text>
											<Progress duration={item.status === 'end' ? item.lastTime : item.duration} lastTime={item.lastTime} />
										</View>
									)}
								</View>
							</Button>
						</>
					)
				}}
				bounces={false}
				overScrollMode='never'
				contentContainerStyle={{ padding: 10, paddingBottom: 0, paddingTop: barHeight, flexGrow: 1 }}
				ListEmptyComponent={() => (
					<View style={{ padding: 10, paddingHorizontal: 30, paddingTop: 57 }}>
						<Text onLayout={e => console.log('onL', e.nativeEvent)} style={{ color: colors.text100, fontSize: 18, textAlign: 'center', fontWeight: '600' }}>
							{activeFilter === 'all' ? 'История просмотров пуста' : 'Ничего не найдено'}
						</Text>
						<Text onLayout={e => console.log('onL', e.nativeEvent)} style={{ color: colors.text200, fontSize: 15, textAlign: 'center' }}>
							{activeFilter === 'all' ? 'Начни смотреть, я сохраню место на котором ты остановился.' : 'Попробуйте изменить параметры фильтра'}
						</Text>
					</View>
				)}
				animated
				onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
			/>
		</TVFocusGuideView>
	)
}

const TvTabBar = ({ activeTab, setActiveTab }: { activeTab: keyof BookmarksTabParamList; setActiveTab: (tab: keyof BookmarksTabParamList) => void }) => {
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const { colors } = useTheme()

	const tabWidth = Dimensions.get('window').width / 3 // 120

	const tabs: Record<keyof BookmarksTabParamList, string> = {
		Favorites: 'Избранное',
		ReleaseNotify: 'Уведомить о выходе',
		History: 'История'
	}

	const objectTabs = Object.values(tabs)
	const objectTabKeys = Object.keys(tabs) as (keyof BookmarksTabParamList)[]

	return (
		<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight style={{ flexDirection: 'row', borderBottomColor: colors.bg300, borderBottomWidth: 1, marginTop: insets.top }}>
			{objectTabs.map((tab, index) => {
				const key = objectTabKeys[index]
				const isActive = key === activeTab

				return (
					<Button key={index} onPress={() => !isActive && setActiveTab(key)} isActive={isActive} padding={0} alignItems='center' justifyContent='center' style={{ width: tabWidth, height: bottomTabBarHeight - insets.bottom - 2 }} transparent>
						<Text style={{ color: isActive ? colors.text100 : colors.text200, fontSize: 14, textAlign: 'center' }}>{tab}</Text>
					</Button>
				)
			})}
		</TVFocusGuideView>
	)
}

export const TvBookmarks = () => {
	const Stack = createNativeStackNavigator<BookmarksTabParamList>()
	const [activeTab, setActiveTab] = useState<keyof BookmarksTabParamList>('History')

	return (
		<View style={{ flex: 1 }}>
			<TvTabBar activeTab={activeTab} setActiveTab={tab => navigationRef.dispatch(StackActions.replace(tab))} />
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
				<Stack.Screen name='ReleaseNotify' component={ReleaseNotify} />
				<Stack.Screen name='History' component={History} />
			</Stack.Navigator>
		</View>
	)
}

export const Bookmarks = () => {
	const Tab = createMaterialTopTabNavigator<BookmarksTabParamList>()

	return (
		<Tab.Navigator initialLayout={Dimensions.get('window')} initialRouteName='History' tabBar={TabBar}>
			<Tab.Screen name='Favorites' component={Favorites} options={{ tabBarLabel: 'Избранное' }} />
			<Tab.Screen name='ReleaseNotify' component={ReleaseNotify} options={{ tabBarLabel: 'Уведомить о выходе' }} />
			<Tab.Screen name='History' component={History} options={{ tabBarLabel: 'История' }} />
		</Tab.Navigator>
	)
}
