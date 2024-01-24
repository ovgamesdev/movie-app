import { Button, FocusableFlatList, FocusableListRenderItem, ImageBackground } from '@components/atoms'
import { TopItemsAllItem } from '@components/molecules/TopItemsAllItem'
import { navigation } from '@navigation'
import { MovieSelectionItem, useGetHdShowcaseQuery } from '@store/kinopoisk'
import { normalizeUrlWithNull } from '@utils'
import { useEffect } from 'react'
import { Dimensions, Platform, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 10 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

export const OttTop10Monthly = () => {
	const insets = useSafeAreaInsets()
	const { isError, isSuccess, data, refetch } = useGetHdShowcaseQuery(undefined, { selectFromResult: ({ data, ...otherParams }) => ({ data: data?.items.find(it => it.id === 'ott_top_10_monthly') ?? data?.items[1] ?? { content: { items: [] }, id: '', title: '' }, ...otherParams }) })

	console.log(data)

	const window = Dimensions.get('window')
	const itemWidth = window.width

	const { styles, theme } = useStyles(stylesheet)

	useEffect(() => {}, [data])

	const renderItem: FocusableListRenderItem<MovieSelectionItem | Skeleton> = ({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
		if (item.__typename === 'Skeleton') {
			return (
				<Button focusable={false} flex={0} padding={5} transparent style={styles.skeletonItem}>
					<View style={styles.skeletonImage} />
					<View style={styles.skeletonDetailContainer}>
						<View style={styles.skeletonDetailTitle} />
						<View style={styles.skeletonDetailDescription} />
					</View>
				</Button>
			)
		}

		if (Platform.isTV) {
			return <TopItemsAllItem data={item.movie} index={index} onFocus={onFocus} onBlur={onBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={hasTVPreferredFocus} />
		} else {
			const poster = normalizeUrlWithNull(item.movie.gallery.posters.verticalWithRightholderLogo?.avatarsUrl ?? item.movie.gallery.posters.vertical?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

			return (
				<View style={{}}>
					<ImageBackground source={{ uri: poster }} style={{ width: itemWidth, aspectRatio: 667 / (1000 - 100), borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} borderBottomLeftRadius={20} borderBottomRightRadius={20}>
						<View style={{ position: 'absolute', top: 30 + insets.top, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' }}>
							<Text style={{ fontSize: 16, color: theme.colors.text100, fontWeight: '700' }}>
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
				<Text style={{ fontSize: 20, color: theme.colors.text100, fontWeight: '700' }}>{data.title}</Text>
			</View>
			<FocusableFlatList
				keyExtractor={it => `list_${data.id}_item_${it.movie.id}`}
				data={isError ? [] : !isSuccess ? skeletonData : data.content.items}
				// data={skeletonData}
				horizontal
				showsHorizontalScrollIndicator={!false}
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
