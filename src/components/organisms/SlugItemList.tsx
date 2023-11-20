import { Button } from '@components/atoms'
import { SlugItem } from '@components/molecules'
import { useNavigation, useTheme } from '@hooks'
import { NavigateNextIcon } from '@icons'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, ListRenderItem, Platform, TVFocusGuideView, Text, View } from 'react-native'
import { IGraphqlMovie } from 'src/store/kinopoisk/types'
import { kinopoiskItemsAdapter, kinopoiskItemsSelector, useGetListBySlugQuery } from '../../store/kinopoisk/kinopoisk.api'

type Props = {
	slug: string
	title: string
}

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

	const { isFetching, data } = useGetListBySlugQuery(
		{ slug, page: 1, limit: 25 },
		{
			selectFromResult: ({ data, ...otherParams }) => ({
				data: kinopoiskItemsSelector.selectAll(data?.docs ?? kinopoiskItemsAdapter.getInitialState()),
				...otherParams
			})
		}
	)

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

	const renderItem: ListRenderItem<{ movie: IGraphqlMovie; positionDiff: number }> = ({ item, index }) => <SlugItem data={item.movie} index={index} onFocus={handleOnFocus} onBlur={handleOnBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />

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
					data={data}
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
							{!isFetching ? null : (
								<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 215.5, backgroundColor: isEmpty ? colors.bg200 : undefined, borderRadius: 6, padding: 5 }}>
									<ActivityIndicator size={data.length !== 0 ? 'large' : 'small'} color={colors.text200} style={{ paddingHorizontal: 10, paddingTop: 20, paddingBottom: 75.5 }} />
								</View>
							)}
							{!Platform.isTV || isEmpty ? null : (
								<Button onFocus={() => handleOnFocus({ index: data.length })} onBlur={handleOnBlur} onPress={() => navigation.push('MovieListSlug', { data: { slug } })} hasTVPreferredFocus={data.length === refreshFocusedItem.focus.index} flex={0} padding={5} transparent alignItems='center' justifyContent='center' style={{ width: 110, height: 215.5 }}>
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
