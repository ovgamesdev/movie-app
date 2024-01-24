import { Button, FocusableFlatList, FocusableListRenderItem } from '@components/atoms'
import { TopItemsAllItem } from '@components/molecules/TopItemsAllItem'
import { navigation } from '@navigation'
import { MovieSelectionItem, useGetHdShowcaseQuery } from '@store/kinopoisk'
import type { FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 10 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

export const TopItemsAllList: FC = () => {
	const { styles, theme } = useStyles(stylesheet)

	const { isError, isSuccess, data, refetch } = useGetHdShowcaseQuery(undefined, { selectFromResult: ({ data, ...otherParams }) => ({ data: data?.items.find(it => it.id === 'top_items_all') ?? data?.items[0] ?? { content: { items: [] }, id: '', title: '' }, ...otherParams }) })
	const isEmpty = data.content.items.length === 0

	// TODO add scrollToIndex
	// const handleOnFocus = ({ index }: { index: number }) => {
	// 	if (index < data.length) {
	// 		ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
	// 	}

	// 	focusedItem.current = { index }
	// }

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

		return <TopItemsAllItem data={item.movie} index={index} onFocus={onFocus} onBlur={onBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={hasTVPreferredFocus} />
	}

	return (
		<>
			<Button
				focusable={false}
				transparent
				style={{ borderWidth: 0 }}
				flexDirection='row'
				// onPress={() => navigation.push('MovieListSlug', { data: { slug } })}
			>
				<Text style={styles.button}>{data.title}</Text>
				{/* {!Platform.isTV && <NavigateNextIcon width={20} height={20} fill={theme.colors.text100} style={styles.buttonIcon} />} */}
			</Button>
			<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight>
				<FocusableFlatList
					keyExtractor={it => `list_${data.id}_item_${it.movie.id}`}
					data={isError ? [] : !isSuccess ? skeletonData : data.content.items}
					// data={skeletonData}
					horizontal
					showsHorizontalScrollIndicator={!false}
					contentContainerStyle={{ flexGrow: 1 }}
					renderItem={renderItem}
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
		</>
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
