import { Button, FocusableFlatList, ImageBackground } from '@components/atoms'
import { Filters } from '@components/molecules'
import { ItemMenuModal } from '@components/organisms'
import { useActions, useTypedSelector } from '@hooks'
import { NotificationsIcon } from '@icons'
import { navigation } from '@navigation'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { WatchHistory, WatchHistoryStatus } from '@store/settings'
import { isSeries, normalizeUrlWithNull } from '@utils'
import React, { useState } from 'react'
import { Animated, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const filters: Record<'all' | WatchHistoryStatus, string> = { all: 'Все', watch: 'Смотрю', end: 'Просмотрено', pause: 'Пауза', new: 'Новое' }

export const History: React.FC = () => {
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)
	const { setItemVisibleModal } = useActions()
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const { styles, theme } = useStyles(stylesheet)
	const [activeFilter, setActiveFilter] = useState<'all' | WatchHistoryStatus>('all')

	const data = Object.values(watchHistory)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => (activeFilter === 'all' ? it : it.status === activeFilter))
	const barHeight = bottomTabBarHeight - insets.bottom + 2

	const [scrollY] = useState(new Animated.Value(0))

	console.log('History data:', data)

	const handleOnLongPress = (item: WatchHistory) => setItemVisibleModal({ item }) // TODO tnfm

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight>
			<Filters filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} scrollY={scrollY} />
			<FocusableFlatList
				data={data}
				keyExtractor={item => `${item.id}`}
				renderItem={({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
					const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

					// TODO item to components
					return (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: theme.colors.bg300 }} />}
							<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onFocus={onFocus} onBlur={onBlur} onLongPress={() => handleOnLongPress(item)} onPress={() => navigation.navigate('Watch', { data: item })} hasTVPreferredFocus={hasTVPreferredFocus}>
								<ImageBackground source={{ uri: poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6} />
								<View style={{ marginLeft: 20, flex: 1, minHeight: 92, maxHeight: 120 }}>
									<Text style={[{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: theme.colors.text100, marginBottom: 4 }, item.notify && { marginRight: 25 }]} numberOfLines={2}>
										{item.title}
									</Text>
									{item.year !== null && (
										<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text200 }} numberOfLines={1}>
											{item.provider ? `[${item.provider}] • ` : ''}
											{item.year}
										</Text>
									)}

									{/* {item.duration && item.lastTime && (
										<View style={{ justifyContent: 'flex-end', flex: 1, marginBottom: 8, marginRight: 10 }}>
											<Text style={{ color: theme.colors.text200, fontSize: 14, marginBottom: 4 }}>{item.status === 'end' ? 'Просмотрено' : item.status === 'pause' ? 'Пауза' : `Осталось ${item.duration - item.lastTime} ${getNoun(item.duration - item.lastTime, 'минута', 'минуты', 'минут')}`}</Text>
											<Progress duration={item.status === 'end' ? item.lastTime : item.duration} lastTime={item.lastTime} />
										</View>
										)} */}

									<View style={{ justifyContent: 'flex-end', flex: 1, marginBottom: 8, marginRight: 10 }}>
										<Text style={{ color: theme.colors.text200, fontSize: 14, marginBottom: 4 }}>{item.status === 'end' ? 'Просмотрено' : item.status === 'pause' ? 'Пауза' : item.status === 'watch' ? 'Смотрю' : isSeries(item.type) ? 'Доступны новые серии' : 'Фильм вышел'}</Text>
										{/* <Progress duration={item.status === 'end' ? item.lastTime : item.duration} lastTime={item.lastTime} /> */}
									</View>
								</View>
								{item.notify && (
									<View style={{ position: 'absolute', right: 0, top: 10 }}>
										<NotificationsIcon width={20} height={20} fill={theme.colors.text100} />
									</View>
								)}
							</Button>
						</>
					)
				}}
				bounces={false}
				overScrollMode='never'
				contentContainerStyle={{ ...styles.contentContainer, paddingTop: barHeight }}
				ListEmptyComponent={() => (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyTitle}>{activeFilter === 'all' ? 'История просмотров пуста' : 'Ничего не найдено'}</Text>
						<Text style={styles.emptyDescription}>{activeFilter === 'all' ? 'Начни смотреть, я сохраню место на котором ты остановился.' : 'Попробуйте изменить параметры фильтра'}</Text>
					</View>
				)}
				animated
				onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
			/>

			<ItemMenuModal />
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		flex: 1,
		marginTop: 0,
		marginBottom: 0
	},
	contentContainer: {
		padding: 10,
		paddingBottom: 0,
		flexGrow: 1
	},
	emptyContainer: {
		padding: 10,
		paddingHorizontal: 30,
		paddingTop: 57
	},
	emptyTitle: {
		color: theme.colors.text100,
		fontSize: 18,
		textAlign: 'center',
		fontWeight: '600'
	},
	emptyDescription: {
		color: theme.colors.text200,
		fontSize: 15,
		textAlign: 'center'
	}
}))
