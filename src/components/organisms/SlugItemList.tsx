import { ActivityIndicator, Button } from '@components/atoms'
import { SlugItem } from '@components/molecules'
import { useNavigation, useTheme } from '@hooks'
import { NavigateNextIcon } from '@icons'
import { IListBySlugResultsDocs, useGetListBySlugQuery } from '@store/kinopoisk'
import React, { useEffect, useRef, useState } from 'react'
import { FlatList, ListRenderItem, Platform, TVFocusGuideView, Text, View } from 'react-native'

type Props = {
	slug: string
	title: string
}
type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 10 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

export const SlugItemList = ({ slug, title }: Props) => {
	const navigation = useNavigation()
	const { colors } = useTheme()
	const ref = useRef<FlatList>(null)
	const focusedItem = useRef<{ index: number }>({ index: -1 })
	const [refreshFocusedItem, setRefreshFocusedItem] = useState({ focus: { index: -1 }, blur: { index: -1 } })

	useEffect(() => {
		if (!Platform.isTV) return

		const listenerFocus = navigation.addListener('focus', () => setRefreshFocusedItem(it => ({ focus: it.blur, blur: { index: -1 } })))
		const listenerBlur = navigation.addListener('blur', () => setRefreshFocusedItem({ focus: { index: -1 }, blur: focusedItem.current }))

		return () => {
			listenerFocus()
			listenerBlur()
		}
	}, [focusedItem.current, navigation])

	const { isFetching, data } = useGetListBySlugQuery({ slug, page: 1, limit: 25 }, { selectFromResult: ({ data, ...otherParams }) => ({ data: data?.docs ?? [], ...otherParams }) })
	const isEmpty = data.length === 0

	const handleOnFocus = ({ index }: { index: number }) => {
		if (index < data.length) {
			ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
		}

		focusedItem.current = { index }
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	const renderItem: ListRenderItem<IListBySlugResultsDocs | Skeleton> = ({ item, index }) => {
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

		return <SlugItem data={item.movie} index={index} onFocus={handleOnFocus} onBlur={handleOnBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
	}

	return (
		<>
			<Button focusable={false} transparent flexDirection='row' onPress={() => navigation.push('MovieListSlug', { data: { slug } })}>
				<Text style={{ color: colors.text100 }}>{title}</Text>
				{!Platform.isTV && <NavigateNextIcon width={20} height={20} fill={colors.text100} style={{ marginLeft: 10 }} />}
			</Button>
			<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
				<FlatList
					keyExtractor={data => `list_${slug}_item_${data.movie.id}`}
					ref={ref}
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
								<Button onFocus={() => handleOnFocus({ index: data.length })} onBlur={handleOnBlur} onPress={() => navigation.push('MovieListSlug', { data: { slug } })} hasTVPreferredFocus={data.length === refreshFocusedItem.focus.index} animation='scale' flex={0} padding={5} transparent alignItems='center' justifyContent='center' style={{ width: 110, height: 215.5 }}>
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
