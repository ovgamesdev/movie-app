import { Button, FocusableFlatList, FocusableListRenderItem } from '@components/atoms'
import { SlugItem } from '@components/molecules'
import { ArrowBackIcon, NavigateNextIcon } from '@icons'
import { navigation } from '@navigation'
import { IListBySlugResultsDocs, useGetListBySlugQuery } from '@store/kinopoisk'
import { FC } from 'react'
import { Platform, TVFocusGuideView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	slug: string
	title: string
}
type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 10 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

export const SlugItemList: FC<Props> = ({ slug, title }) => {
	const { styles, theme } = useStyles(stylesheet)

	const { isError, isSuccess, data, refetch } = useGetListBySlugQuery({ slug, page: 1, limit: 25 }, { selectFromResult: ({ data, ...otherParams }) => ({ data: data?.docs ?? [], ...otherParams }) })
	const isEmpty = data.length === 0

	// TODO add scrollToIndex
	// const handleOnFocus = ({ index }: { index: number }) => {
	// 	if (index < data.length) {
	// 		ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
	// 	}

	// 	focusedItem.current = { index }
	// }

	const renderItem: FocusableListRenderItem<IListBySlugResultsDocs | Skeleton> = ({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
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

		return <SlugItem data={item.movie} index={index} onFocus={onFocus} onBlur={onBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={hasTVPreferredFocus} />
	}

	return (
		<>
			<Button focusable={false} animation='scale' transparent style={{ borderWidth: 0 }} flexDirection='row' onPress={() => navigation.push('MovieListSlug', { data: { slug } })}>
				<Text style={styles.button}>{title}</Text>
				{!Platform.isTV && <NavigateNextIcon width={20} height={20} fill={theme.colors.text100} style={styles.buttonIcon} />}
			</Button>
			<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight>
				<FocusableFlatList
					keyExtractor={data => `list_${slug}_item_${data.movie.id}`}
					data={isError ? [] : !isSuccess ? skeletonData : data}
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
							{isEmpty ? null : (
								<Button onPress={() => navigation.push('MovieListSlug', { data: { slug } })} animation='scale' flex={0} padding={0} transparent alignItems='center' justifyContent='center' style={styles.skeletonItem}>
									<View style={styles.footerItemIconContainer}>
										<ArrowBackIcon width={30} height={30} fill={theme.colors.text200} rotation={180} />
									</View>
									<Text style={styles.footerItemText}>Показать все</Text>
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
	footerItemIconContainer: {
		borderRadius: 999,
		padding: 10,
		backgroundColor: theme.colors.bg200
	},
	footerItemText: {
		color: theme.colors.text200,
		fontSize: 14,
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
