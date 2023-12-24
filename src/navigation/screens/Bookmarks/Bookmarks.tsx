import { Button, FocusableFlatList, ImageBackground, Progress } from '@components/atoms'
import { Filters } from '@components/molecules'
import { useActions, useNavigation, useTheme, useTypedSelector } from '@hooks'
import { BookmarksTabParamList, TabBar, navigationRef } from '@navigation'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { StackActions } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { WatchHistory, WatchHistoryStatus } from '@store/settings'
import { getNoun, normalizeUrlWithNull } from '@utils'
import React, { useState } from 'react'
import { Alert, Animated, Dimensions, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
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
const filters: Record<'all' | WatchHistoryStatus, string> = { all: 'Все', watch: 'Смотрю', end: 'Просмотрено', pause: 'Пауза', new: 'Новое' }
const History: React.FC = () => {
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)
	const { removeItemByPath } = useActions()
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

	const handleOnLongPress = (item: WatchHistory) => {
		Alert.alert(
			`«${item.title}»`,
			'Удалить из истории?',
			[
				{
					text: 'Cancel',
					style: 'cancel'
				},
				{
					text: 'Детали',
					onPress: () => navigation.push('Movie', { data: item })
				},
				{
					text: 'Удалить',
					onPress: () => removeItemByPath(['watchHistory', `${item.id}:${item.provider}`])
				}
			],
			{ cancelable: true }
		)
	}

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight>
			<Filters filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} scrollY={scrollY} />

			<FocusableFlatList
				data={data}
				keyExtractor={item => `${item.id}:${item.provider}`}
				renderItem={({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
					const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

					return (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: colors.bg300 }} />}
							<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onFocus={onFocus} onBlur={onBlur} onLongPress={() => handleOnLongPress(item)} onPress={() => navigation.push('Watch', { data: item })} hasTVPreferredFocus={hasTVPreferredFocus}>
								<ImageBackground source={{ uri: poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6} />
								<View style={{ marginLeft: 20, flex: 1, minHeight: 92, maxHeight: 120 }}>
									<Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: colors.text100, marginBottom: 4 }} numberOfLines={2}>
										{item.title}
									</Text>
									{item.year !== null && (
										<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: colors.text200 }} numberOfLines={1}>
											{item.provider ? `[${item.provider}] • ` : ''}
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

	const tabWidth = Dimensions.get('window').width / 2 // 120

	const tabs: Record<keyof BookmarksTabParamList, string> = {
		Favorites: 'Избранное',
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
			<Tab.Screen name='History' component={History} options={{ tabBarLabel: 'История' }} />
		</Tab.Navigator>
	)
}
