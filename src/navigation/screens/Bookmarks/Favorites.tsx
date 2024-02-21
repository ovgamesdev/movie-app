import { Button, FocusableFlashList, ImageBackground, type FocusableFlashListRenderItem, type FocusableFlashListType } from '@components/atoms'
import { Filters } from '@components/molecules'
import { useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { MovieType } from '@store/kinopoisk'
import { Bookmarks } from '@store/settings'
import { isSeries, normalizeUrlWithNull } from '@utils'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { Animated, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type FilterKeys = 'all' | 'movie' | 'person' | 'film' | 'series'
const filters_bookmarks: Record<FilterKeys, string> = { all: 'Все', movie: 'Фильмы и сериалы', person: 'Персоны', film: 'Фильмы', series: 'Сериалы' }

export const Favorites: FC = () => {
	const bookmarks = useTypedSelector(state => state.settings.settings.bookmarks)
	const { setItemVisibleModal } = useActions()
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { styles, theme } = useStyles(stylesheet)
	const [activeFilter, setActiveFilter] = useState<FilterKeys>('all')

	const ref = useRef<FocusableFlashListType>(null)

	const data = Object.values(bookmarks)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => {
			if (activeFilter === 'all') {
				return true
			} else if (activeFilter === 'person') {
				return it.type === 'Person'
			} else if (activeFilter === 'movie') {
				return it.type !== 'Person'
			} else {
				const isSeriesType = isSeries(it.type as MovieType)
				return it.type !== 'Person' && (activeFilter === 'series' ? isSeriesType : !isSeriesType)
			}
		})
	const barHeight = bottomTabBarHeight + 2 - (isShowNetInfo ? 0 : insets.bottom)

	const [scrollY] = useState(new Animated.Value(0))

	console.log('Favorites data:', data)

	const handleOnLongPress = (item: Bookmarks) => {} // setItemVisibleModal({ item })

	const renderItem: FocusableFlashListRenderItem<Bookmarks> = useCallback(({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
		const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

		return (
			<>
				{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: theme.colors.bg300 }} />}
				<Button
					onLayout={e => console.log(e.nativeEvent.layout)}
					animation='scale'
					transparent
					flexDirection='row'
					paddingHorizontal={0}
					paddingVertical={10}
					onFocus={onFocus}
					onBlur={onBlur}
					onLongPress={() => handleOnLongPress(item)}
					onPress={() => {
						if (item.type === 'Person') {
							navigation.navigate('Person', { data: { id: item.id } })
						} else {
							navigation.navigate('Movie', { data: { id: item.id, type: item.type } })
						}
					}}
					hasTVPreferredFocus={hasTVPreferredFocus}>
					<ImageBackground source={{ uri: poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6} />
					<View style={{ marginLeft: 20, flex: 1, minHeight: 92, maxHeight: 120 }}>
						<Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: theme.colors.text100, marginBottom: 4 }} numberOfLines={2}>
							{item.title}
						</Text>

						<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text200 }} numberOfLines={1}>
							{['year' in item ? item.year : null].filter(it => it).join(' • ')}
						</Text>
					</View>
				</Button>
			</>
		)
	}, []) // TODO theme

	const keyExtractor = useCallback((item: Bookmarks) => `${item.id}`, [])

	const ListEmptyComponent = useCallback(
		() => (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyTitle}>{activeFilter === 'all' ? 'Добавляй в избранное' : 'Ничего не найдено'}</Text>
				<Text style={styles.emptyDescription}>{activeFilter === 'all' ? 'Чтобы не пришлось искать.' : 'Попробуйте изменить параметры фильтра'}</Text>
			</View>
		),
		[styles, activeFilter]
	)

	const handleOnScroll = useMemo(() => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true }), [scrollY])

	const handleChangeActiveFilter = (value: FilterKeys) => {
		setActiveFilter(value)
		ref.current?.scrollToOffset({ offset: 0, animated: false })
	}

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight>
			<Filters filters={filters_bookmarks} activeFilter={activeFilter} setActiveFilter={handleChangeActiveFilter} scrollY={scrollY} />
			<FocusableFlashList ref={ref} data={data} keyExtractor={keyExtractor} renderItem={renderItem} estimatedItemSize={146} bounces={false} overScrollMode='never' contentContainerStyle={{ ...styles.contentContainer, paddingTop: barHeight }} ListEmptyComponent={ListEmptyComponent} animated onScroll={handleOnScroll} />

			{/* <ItemMenuModal /> */}
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
