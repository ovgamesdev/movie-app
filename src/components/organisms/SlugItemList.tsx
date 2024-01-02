import { ActivityIndicator, Button, FocusableFlatList, FocusableListRenderItem } from '@components/atoms'
import { SlugItem } from '@components/molecules'
import { useTheme } from '@hooks'
import { NavigateNextIcon } from '@icons'
import { navigation } from '@navigation'
import { IListBySlugResultsDocs, useGetListBySlugQuery } from '@store/kinopoisk'
import React from 'react'
import { Platform, TVFocusGuideView, Text, View } from 'react-native'

type Props = {
	slug: string
	title: string
}
type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 10 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

export const SlugItemList = ({ slug, title }: Props) => {
	const { colors } = useTheme()

	const { isFetching, data } = useGetListBySlugQuery({ slug, page: 1, limit: 25 }, { selectFromResult: ({ data, ...otherParams }) => ({ data: data?.docs ?? [], ...otherParams }) })
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
				<Button focusable={false} flex={0} padding={5} transparent style={{ width: 110, height: 215.5 }}>
					<View style={{ height: 140, aspectRatio: 667 / 1000, backgroundColor: colors.bg200, borderRadius: 6 }} />
					<View style={{ paddingTop: 5 }}>
						<View style={{ width: '90%', height: 14, marginTop: 2, backgroundColor: colors.bg200 }} />
						<View style={{ width: '45%', height: 12, marginTop: 5 + 3, backgroundColor: colors.bg200 }} />
					</View>
				</Button>
			)
		}

		return <SlugItem data={item.movie} index={index} onFocus={onFocus} onBlur={onBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={hasTVPreferredFocus} />
	}

	return (
		<>
			<Button focusable={false} transparent flexDirection='row' onPress={() => navigation.push('MovieListSlug', { data: { slug } })}>
				<Text style={{ color: colors.text100 }}>{title}</Text>
				{!Platform.isTV && <NavigateNextIcon width={20} height={20} fill={colors.text100} style={{ marginLeft: 10 }} />}
			</Button>
			<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
				<FocusableFlatList
					keyExtractor={data => `list_${slug}_item_${data.movie.id}`}
					data={isFetching ? skeletonData : data}
					// data={skeletonData}
					horizontal
					showsHorizontalScrollIndicator={!false}
					contentContainerStyle={{ flexGrow: 1 }}
					renderItem={renderItem}
					ListEmptyComponent={
						isFetching ? null : (
							<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 215.5, backgroundColor: colors.bg200, borderRadius: 6, padding: 5 }}>
								<Text style={{ textAlign: 'center', color: colors.text100 }}>Лист пуст</Text>
								{/* <Text style={{ textAlign: 'center', color: colors.text200 }}></Text> */}
							</View>
						)
					}
					ListFooterComponent={
						<>
							{/* TODO ??? */}
							{!isFetching ? null : (
								<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 215.5, backgroundColor: isEmpty ? colors.bg200 : undefined, borderRadius: 6, padding: 5 }}>
									<ActivityIndicator size={data.length !== 0 ? 'large' : 'small'} style={{ paddingHorizontal: 10, paddingTop: 20, paddingBottom: 75.5 }} />
								</View>
							)}
							{!Platform.isTV || isEmpty ? null : (
								<Button onPress={() => navigation.push('MovieListSlug', { data: { slug } })} animation='scale' flex={0} padding={5} transparent alignItems='center' justifyContent='center' style={{ width: 110, height: 215.5 }}>
									<Text style={{ color: colors.text200, paddingHorizontal: 10, paddingTop: 20, paddingBottom: 75.5 }}>More..</Text>
								</Button>
							)}
						</>
					}
					ListFooterComponentStyle={{ flexGrow: 1 }}
				/>
			</TVFocusGuideView>
		</>
	)
}
