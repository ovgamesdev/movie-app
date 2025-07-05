import { Button, FocusableFlashList, ImageBackground, Progress, type FocusableFlashListRenderItem, type FocusableFlashListType } from '@components/atoms'
import { Filters, FiltersType } from '@components/molecules'
import { useTypedSelector } from '@hooks'
import { NotificationsIcon } from '@icons'
import { BookmarksTabParamList, navigation } from '@navigation'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useFocusEffect, useScrollToTop } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { WatchHistory, WatchHistoryStatus } from '@store/settings'
import { getNoun, isSeries, normalizeUrlWithNull, watchHistoryProviderToString } from '@utils'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { Animated, InteractionManager, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type FilterKeys = 'all' | WatchHistoryStatus
const filters: Record<FilterKeys, string> = { all: 'Все', watch: 'Смотрю', end: 'Просмотрено', pause: 'Пауза', new: 'Новое', dropped: 'Брошено' }

type Props = NativeStackScreenProps<BookmarksTabParamList, 'History'>

export const History: FC<Props> = ({ navigation: nav, route: { params } }) => {
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { styles, theme } = useStyles(stylesheet)
	const [activeFilter, setActiveFilter] = useState<FilterKeys>('all')

	const ref = useRef<FocusableFlashListType>(null)
	const filtersRef = useRef<FiltersType>(null)

	const data = Object.values(watchHistory)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => (activeFilter === 'all' ? it : it.status === activeFilter))
	const barHeight = bottomTabBarHeight + 2 - (isShowNetInfo ? 0 : insets.bottom)

	const scrollY = useRef(new Animated.Value(0)).current

	console.log(`History data: ${data.length}`)

	const handleOnLongPress = (data: WatchHistory) => navigation.push('ItemMenuModal', { data })

	const renderItem: FocusableFlashListRenderItem<WatchHistory> = useCallback(
		({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
			const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/300x450' })

			return (
				<>
					{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: theme.colors.bg300 }} />}
					<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onFocus={onFocus} onBlur={onBlur} onLongPress={() => handleOnLongPress(item)} onPress={() => navigation.navigate('Watch', { data: item })} hasTVPreferredFocus={hasTVPreferredFocus}>
						<ImageBackground source={{ uri: poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6} />
						<View style={{ marginLeft: 20, flex: 1, minHeight: 92, maxHeight: 120 }}>
							<Text style={[{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: theme.colors.text100, marginBottom: 4 }, item.notify && { marginRight: 25 }]} numberOfLines={2}>
								{item.title}
							</Text>

							<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text200 }} numberOfLines={1}>
								{[item.provider ? `[${watchHistoryProviderToString(item.provider)}]` : null, item.year, [typeof item.season === 'number' ? `${item.season} сезон` : null, typeof item.episode === 'string' ? `${item.episode} серия` : null].filter(it => it).join(', '), item.translation?.title].filter(it => it).join(' • ')}
							</Text>

							<View style={{ justifyContent: 'flex-end', flex: 1, marginBottom: 8, marginRight: 10 }}>
								<Text style={{ color: theme.colors.text200, fontSize: 14, marginBottom: 4 }}>{item.status === 'end' ? 'Просмотрено' : item.status === 'dropped' ? 'Брошено' : item.status === 'pause' ? 'Пауза' : item.status === 'watch' ? (typeof item.duration === 'number' && typeof item.lastTime === 'number' && item.duration !== -1 && item.lastTime !== -1 ? `Осталось ${Math.floor((item.duration - item.lastTime) / 60)} ${getNoun(Math.floor((item.duration - item.lastTime) / 60), 'минута', 'минуты', 'минут')}` : 'Смотрю') : isSeries(item.type) ? 'Доступны новые серии' : 'Фильм вышел'}</Text>
								{(item.status === 'end' || item.status === 'watch') && typeof item.duration === 'number' && typeof item.lastTime === 'number' && item.duration !== -1 && item.lastTime !== -1 ? <Progress duration={item.status === 'end' ? item.lastTime : item.duration} lastTime={item.lastTime} /> : null}
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
		},
		[theme]
	)

	const keyExtractor = useCallback((item: WatchHistory) => `${item.id}`, [])

	const ListEmptyComponent = useCallback(
		() => (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyTitle}>{activeFilter === 'all' ? 'История просмотров пуста' : 'Ничего не найдено'}</Text>
				<Text style={styles.emptyDescription}>{activeFilter === 'all' ? 'Начни смотреть, я сохраню место на котором ты остановился.' : 'Попробуйте изменить параметры фильтра'}</Text>
			</View>
		),
		[styles, activeFilter]
	)

	const handleOnScroll = useMemo(() => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true }), [scrollY])

	const handleChangeActiveFilter = (value: string) => {
		setActiveFilter(value as FilterKeys)
		ref.current?.scrollToOffset({ offset: 0, animated: false })
	}
	const scrollToTop = () => {
		ref.current?.scrollToOffset({ offset: 0, animated: true })
	}

	const hasScrollToItem = useRef<string | null>(null)
	const initialScrollIndex = data.findIndex(it => it.id === params?.scrollToItem.id)
	useFocusEffect(
		useCallback(() => {
			if (!params) return

			const index = data.findIndex(it => it.id === params.scrollToItem.id)

			if (index === -1 && hasScrollToItem.current !== `${params.scrollToItem.id}:${params.lookAtHistory}`) {
				setActiveFilter('all')
				return
			}

			const task = InteractionManager.runAfterInteractions(() => {
				if (index !== -1 && hasScrollToItem.current !== `${params.scrollToItem.id}:${params.lookAtHistory}`) {
					hasScrollToItem.current = `${params.scrollToItem.id}:${params.lookAtHistory}`
					setTimeout(() => {
						ref.current?.scrollToIndex({ index, viewOffset: barHeight })
						filtersRef.current?.show()
					}, 0)
				}
			})

			return () => task.cancel()
		}, [params, ref.current, data])
	)

	useScrollToTop(useRef({ scrollToTop }))

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight>
			<Filters ref={filtersRef} filters={filters} activeFilter={activeFilter} setActiveFilter={handleChangeActiveFilter} scrollToTop={scrollToTop} scrollY={scrollY} />
			<FocusableFlashList initialScrollIndex={initialScrollIndex} ref={ref} data={data} keyExtractor={keyExtractor} renderItem={renderItem} estimatedItemSize={146} bounces={false} overScrollMode='never' contentContainerStyle={{ ...styles.contentContainer, paddingTop: barHeight }} ListEmptyComponent={ListEmptyComponent} animated onScroll={handleOnScroll} />
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
		paddingBottom: 0
		// flexGrow: 1
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
