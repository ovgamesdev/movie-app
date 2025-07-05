import { AutoScrollFlatList, BlurView, Button, FocusableFlatList, FocusableListRenderItem, ImageBackground } from '@components/atoms'
import { TopItemsAllItem } from '@components/molecules/TopItemsAllItem'
import { navigation } from '@navigation'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MovieSelectionItem, useGetHdShowcaseQuery } from '@store/kinopoisk'
import { normalizeUrlWithNull } from '@utils'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 10 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

type SavedDataType = {
	content: {
		items: MovieSelectionItem[]
	}
	id: string
	title: string
	lastUpdate?: number
}

const oneHourInMillis = 3600000 // 60000

export const OttTop10Monthly = () => {
	const insets = useSafeAreaInsets()
	const { styles, theme } = useStyles(stylesheet)

	const [savedState, setSavedState] = useState<{ status: null | 'loading' | 'await_from_api'; data: SavedDataType | null }>({ status: 'loading', data: null })
	const dateNow = useRef<number | boolean>(false)

	useEffect(() => {
		const init = async () => {
			try {
				const as_item: SavedDataType | null = JSON.parse((await AsyncStorage.getItem('top_10_monthly')) ?? 'null')

				// console.log({ as_item, time: as_item?.lastUpdate ? Date.now() - as_item.lastUpdate : null, oneHourInMillis, is: as_item?.lastUpdate && Date.now() - as_item.lastUpdate < oneHourInMillis })

				if (as_item?.lastUpdate && Date.now() - as_item.lastUpdate < oneHourInMillis) {
					setSavedState({ status: null, data: as_item })
					// console.log('loading data from AsyncStorage')
					return
				} else {
					dateNow.current = Date.now()
					setSavedState({ status: 'await_from_api', data: as_item })
				}
			} catch (e) {
				console.error('[OttTop10Monthly]', e)
			}
		}

		init()
	}, [])

	const {
		isError,
		isSuccess: _isSuccess,
		data: _data,
		refetch
	} = useGetHdShowcaseQuery(undefined, {
		selectFromResult: ({ data, ...otherParams }) => {
			const _dta_ = { data: data?.items.find(it => it.id === 'ott_top_10_monthly') ?? data?.items[1] ?? null, ...otherParams }

			try {
				if (_dta_.data && typeof dateNow.current === 'number') {
					// console.log('set new data to AsyncStorage')
					AsyncStorage.setItem('top_10_monthly', JSON.stringify({ ..._dta_.data, lastUpdate: Date.now() }))
					dateNow.current = true
				}
			} catch (e) {
				console.error('[OttTop10Monthly] error:', e)
			}

			return _dta_
		},
		skip: savedState.status !== 'await_from_api'
	})

	const data: SavedDataType = _data ?? savedState.data ?? { content: { items: [] }, id: 'loading', title: 'Loading' }
	const isSuccess: boolean = _isSuccess || data.id !== 'loading'

	const window = Dimensions.get('window')
	const itemWidth = window.width

	const imageSize = itemWidth <= 720 ? 720 : itemWidth <= 1080 ? 1080 : itemWidth <= 1920 ? 1920 : 3840

	const renderItem: FocusableListRenderItem<MovieSelectionItem | Skeleton> = ({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
		if (item.__typename === 'Skeleton') {
			if (Platform.isTV) {
				return (
					<Button focusable={false} flex={0} padding={5} transparent style={styles.skeletonItem}>
						<View style={styles.skeletonImage} />
						<View style={styles.skeletonDetailContainer}>
							<View style={styles.skeletonDetailTitle} />
							<View style={styles.skeletonDetailDescription} />
						</View>
					</Button>
				)
			} else {
				return (
					<View style={{ width: itemWidth, aspectRatio: 667 / (1000 - 100), borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: insets.top, backgroundColor: theme.colors.bg300 }}>
						<View style={{ position: 'absolute', top: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' }}>
							<Text style={{ fontSize: 16, color: theme.colors.primary300, fontWeight: '700' }}>
								{index + 1}/{data.content.items.length}
							</Text>
						</View>
						<View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' }}>
							<Button text='Смотреть' />
						</View>
					</View>
				)
			}
		}

		if (Platform.isTV) {
			return <TopItemsAllItem data={item.movie} index={index} onFocus={onFocus} onBlur={onBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={hasTVPreferredFocus} />
		} else {
			const poster = normalizeUrlWithNull(item.movie.gallery.posters.verticalWithRightholderLogo?.avatarsUrl ?? item.movie.gallery.posters.vertical?.avatarsUrl, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: `/${imageSize}x` })

			return (
				<View>
					{insets.top > 0 ? (
						<View style={{ position: 'absolute', width: itemWidth, aspectRatio: 2 / 1, overflow: 'hidden' }}>
							<ImageBackground source={{ uri: poster }} style={{ width: itemWidth, aspectRatio: 667 / (1000 - 100), borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: insets.top, transform: [{ scale: 1.1 }] }} borderBottomLeftRadius={20} borderBottomRightRadius={20} />
							<BlurView blurRadius={50} />
						</View>
					) : null}
					<ImageBackground source={{ uri: poster }} style={{ width: itemWidth, aspectRatio: 667 / (1000 - 100), borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: insets.top }} borderBottomLeftRadius={20} borderBottomRightRadius={20}>
						<View style={{ position: 'absolute', top: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' }}>
							<Text style={{ fontSize: 16, color: theme.colors.primary300, fontWeight: '700' }}>
								{index + 1}/{data.content.items.length}
							</Text>
						</View>
						<View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' }}>
							<Button text='Смотреть' onPress={() => navigation.push('Movie', { data: { id: item.movie.id, type: item.movie.__typename } })} />
						</View>
					</ImageBackground>
				</View>
			)
		}
	}

	return (
		<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight>
			<View style={{ position: 'absolute', top: 10 + insets.top, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', zIndex: 5 }}>
				<Text style={{ fontSize: 20, color: theme.colors.primary300, fontWeight: '700' }}>{data.title}</Text>
			</View>

			{!Platform.isTV ? (
				<AutoScrollFlatList
					keyExtractor={it => `list_${data.id}_item_${it.movie.id}`}
					data={isError ? (data.content.items.length > 0 ? data.content.items : []) : !isSuccess ? skeletonData : data.content.items}
					//
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					renderItem={renderItem}
					snapToAlignment='center'
					decelerationRate={0.5}
					snapToInterval={itemWidth}
					autoScroll={8000}
				/>
			) : (
				<FocusableFlatList
					keyExtractor={it => `list_${data.id}_item_${it.movie.id}`}
					data={isError ? [] : !isSuccess ? skeletonData : data.content.items}
					// data={skeletonData}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					renderItem={renderItem}
					snapToAlignment='center'
					decelerationRate={0.5}
					snapToInterval={itemWidth}
					ListFooterComponent={
						<>
							{!isError ? null : (
								<Button onPress={refetch} animation='scale' flex={1} padding={5} transparent alignItems='center' justifyContent='center' style={styles.footerErrorContainer}>
									<Text style={styles.footerErrorText}>Произошла ошибка</Text>
									<Text style={styles.footerErrorDescription}>Повторите попытку</Text>
								</Button>
							)}
						</>
					}
					ListFooterComponentStyle={styles.footerContainer}
				/>
			)}
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	button: {
		color: theme.colors.text100,
		fontSize: 14
	},
	buttonIcon: {
		marginLeft: 10
	},
	// FOOTER
	footerContainer: {
		flexGrow: 1
	},
	footerItemText: {
		color: theme.colors.text200,
		fontSize: 14,
		paddingHorizontal: 10,
		paddingTop: 20,
		paddingBottom: 75.5
	},
	footerErrorContainer: {
		backgroundColor: theme.colors.bg200,
		height: 215.5
	},
	footerErrorText: {
		color: theme.colors.text100,
		fontSize: 16,
		paddingHorizontal: 10
	},
	footerErrorDescription: {
		color: theme.colors.text200,
		fontSize: 12,
		paddingHorizontal: 10,
		paddingTop: 5
	},
	// ITEM
	skeletonItem: {
		width: 110,
		height: 215.5
	},
	skeletonImage: {
		height: 140,
		aspectRatio: 667 / 1000,
		backgroundColor: theme.colors.bg200,
		borderRadius: 6
	},
	skeletonDetailContainer: {
		paddingTop: 5
	},
	skeletonDetailTitle: {
		width: '90%',
		height: 14,
		marginTop: 2,
		backgroundColor: theme.colors.bg200
	},
	skeletonDetailDescription: {
		width: '45%',
		height: 12,
		marginTop: 5 + 3,
		backgroundColor: theme.colors.bg200
	}
}))
