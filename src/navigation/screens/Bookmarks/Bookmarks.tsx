import { Button, FocusableFlatList, ImageBackground, Progress } from '@components/atoms'
import { IContentReleaseNotifyMovie, useNavigation, useTheme, useTypedSelector } from '@hooks'
import { BookmarksTabParamList, navigationRef } from '@navigation'
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
import { TabBar } from '../../TabBar'

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
										{item.title ?? item.name}
										{/* TODO name: old value */}
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
				contentContainerStyle={{ padding: 10, paddingBottom: 5, paddingTop: 10 }}
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
const History: React.FC = () => {
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)
	const { colors, getColorForTheme } = useTheme()
	const navigation = useNavigation()

	const [activeFilter, setActiveFilter] = useState<'all' | WatchHistoryStatus>('all')

	const data = Object.values(watchHistory)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => (activeFilter === 'all' ? it : it.status === activeFilter))
	const barHeight = 45

	const scrollY = new Animated.Value(0)
	const diffClamp = Animated.diffClamp(scrollY, 0, barHeight)
	const translateY = diffClamp.interpolate({ inputRange: [0, barHeight], outputRange: [0, -barHeight] })

	console.log('History data:', data)

	const filters: Record<'all' | WatchHistoryStatus, string> = {
		all: 'Все',
		watch: 'Смотрю',
		pause: 'Пауза',
		end: 'Просмотрено'
	}

	const objectFilters = Object.values(filters)
	const objectFilterKeys = Object.keys(filters) as ('all' | WatchHistoryStatus)[]

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight>
			<Animated.View style={{ transform: [{ translateY }], zIndex: 1, height: barHeight, position: 'absolute', top: 0, left: 0, right: 0 }}>
				<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight style={{ flexDirection: 'row', borderBottomColor: colors.bg300, borderBottomWidth: 1, paddingVertical: 4, backgroundColor: colors.bg100 }}>
					{objectFilters.map((tab, index) => {
						const key = objectFilterKeys[index]
						const isActive = key === activeFilter

						return (
							<Button key={index} onPress={() => !isActive && setActiveFilter(key)} isActive={isActive} paddingVertical={6} paddingHorizontal={12} alignItems='center' justifyContent='center' activeButtonColor={colors.primary100} activePressedButtonColor={getColorForTheme({ dark: 'primary200', light: 'text200' })} style={{ minWidth: 48, marginLeft: 12 }}>
								<Text style={{ color: isActive ? colors.text100 : colors.text200, fontSize: 14, textAlign: 'center' }}>{tab}</Text>
							</Button>
						)
					})}
				</TVFocusGuideView>
			</Animated.View>

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
										<View style={{ justifyContent: 'flex-end', flex: 1, marginBottom: 8 }}>
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
				contentContainerStyle={{ padding: 10, paddingBottom: 5, paddingTop: 10 + barHeight }}
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
	const [activeTab, setActiveTab] = useState<keyof BookmarksTabParamList>('ReleaseNotify')

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
		<Tab.Navigator initialLayout={Dimensions.get('window')} initialRouteName='ReleaseNotify' tabBar={TabBar}>
			<Tab.Screen name='Favorites' component={Favorites} options={{ tabBarLabel: 'Избранное' }} />
			<Tab.Screen name='ReleaseNotify' component={ReleaseNotify} options={{ tabBarLabel: 'Уведомить о выходе' }} />
			<Tab.Screen name='History' component={History} options={{ tabBarLabel: 'История' }} />
		</Tab.Navigator>
	)
}
