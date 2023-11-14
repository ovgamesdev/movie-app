import { SlugItem } from '@components/molecules'
import { useNavigation, useTheme } from '@hooks'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Platform, TVFocusGuideView, Text, View } from 'react-native'
import { IGraphqlMovie } from 'src/store/kinopoisk/types'
import { useGetListBySlugQuery } from '../../store/kinopoisk/kinopoisk.api'

type Props = {
	slug: string
	title: string
	onPress: ({ id }: { id: number }) => void
}

export const SlugItemList = ({ slug, title, onPress }: Props) => {
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

	const { isFetching, data: res, isError, error } = useGetListBySlugQuery({ slug, page: 1, limit: 25 })

	const items = res?.data?.movieListBySlug?.movies?.items ?? []
	const isEmpty = res?.data?.movieListBySlug?.movies?.total ?? 0 > 0

	if (isError) {
		console.log(error)
	}

	const handleOnFocus = ({ index }: { index: number }) => {
		ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })

		focusedItem.current = { index }
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	const renderItem = ({ item, index }: { item: { movie: IGraphqlMovie; positionDiff: number }; index: number }) => <SlugItem data={item.movie} index={index} onFocus={handleOnFocus} onBlur={handleOnBlur} onPress={onPress} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />

	return (
		<>
			<Text style={{ color: colors.text100, paddingVertical: 5 }}>{title}</Text>
			<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
				<FlatList
					keyExtractor={data => `list_${slug}_item_${data.movie.id}`}
					ref={ref}
					data={items}
					horizontal
					showsHorizontalScrollIndicator={!false}
					contentContainerStyle={{ flexGrow: 1 }}
					renderItem={renderItem}
					ListEmptyComponent={
						isFetching ? null : (
							<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 215.5, backgroundColor: colors.bg200, borderRadius: 6, padding: 5, flexGrow: 1 }}>
								<Text style={{ textAlign: 'center', color: colors.text100 }}>Лист пуст</Text>
								{/* <Text style={{ textAlign: 'center', color: colors.text200 }}></Text> */}
							</View>
						)
					}
					ListFooterComponent={
						!isFetching ? null : (
							<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 215.5, backgroundColor: isEmpty ? colors.bg200 : undefined, borderRadius: 6, padding: 5 }}>
								<ActivityIndicator size={isEmpty ? 'large' : 'small'} color={colors.text200} style={{ paddingHorizontal: 10, paddingTop: 20, paddingBottom: 75.5 }} />
							</View>
						)
					}
					ListFooterComponentStyle={{ flexGrow: 1 }}
				/>
			</TVFocusGuideView>
		</>
	)
}
