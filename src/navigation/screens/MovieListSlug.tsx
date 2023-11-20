import { Button, DropDown } from '@components/atoms'
import { useTheme } from '@hooks'
import { RootStackParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, ListRenderItem, Platform, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { kinopoiskItemsAdapter, kinopoiskItemsSelector, useGetListBySlugQuery } from '../../store/kinopoisk/kinopoisk.api'
import { IGraphqlMovie } from '../../store/kinopoisk/types'

type Props = NativeStackScreenProps<RootStackParamList, 'MovieListSlug'>

export const MovieListSlug = ({ navigation, route }: Props) => {
	const { slug, filters } = route.params.data

	const insets = useSafeAreaInsets()
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

	const [page, setPage] = useState(1)
	const [order, setOrder] = useState('POSITION_ASC')
	const { isFetching, data } = useGetListBySlugQuery(
		{ slug, filters, order, page, limit: 50 },
		{
			selectFromResult: ({ data, ...otherParams }) => ({
				data: { ...data, docs: kinopoiskItemsSelector.selectAll(data?.docs ?? kinopoiskItemsAdapter.getInitialState()) },
				...otherParams
			})
		}
	)
	const isEmpty = data.docs.length === 0

	const handleOnFocus = ({ index }: { index: number }) => {
		if (index < data.docs.length) {
			ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
		}

		focusedItem.current = { index }

		if (!isFetching && index > data.docs.length - 1 - 10) {
			setPage(page => page + 1)
		}
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	const handleScrollEnd = () => {
		if (!isFetching) {
			setPage(page => page + 1)
		}
	}

	const renderItem: ListRenderItem<{ movie: IGraphqlMovie; positionDiff: number }> = ({ item, index }) => {
		return <Button style={{ height: 100 }} text={`${index + 1}${item.positionDiff ? ' (' + item.positionDiff + ')' : ''} ${item.movie.title.russian ?? item.movie.title.original}`} onFocus={() => handleOnFocus({ index })} onBlur={handleOnBlur} onPress={() => navigation.push('Movie', { data: { id: item.movie.id } })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
		// return <SlugItem data={item.movie} index={index} onFocus={handleOnFocus} onBlur={handleOnBlur} onPress={data => navigation.push('Movie', { data })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
	}

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} autoFocus trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<FlatList
				keyExtractor={data => `list_${slug}_item_${data.movie.id}`}
				getItemLayout={(_, index) => ({ length: 100, offset: 100 * index, index })}
				ref={ref}
				data={data.docs}
				showsHorizontalScrollIndicator={!false}
				onEndReached={handleScrollEnd}
				onEndReachedThreshold={1}
				contentContainerStyle={{ padding: 10, paddingBottom: 10 + insets.bottom, flexGrow: 1 }}
				renderItem={renderItem}
				ListEmptyComponent={
					isFetching ? null : (
						<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', flexGrow: isEmpty ? 1 : undefined, backgroundColor: colors.bg200, borderRadius: 6, padding: 5 }}>
							<Text style={{ textAlign: 'center', color: colors.text100 }}>Лист пуст</Text>
							{/* <Text style={{ textAlign: 'center', color: colors.text200 }}></Text> */}
						</View>
					)
				}
				ListFooterComponent={
					!isFetching ? null : (
						<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', flexGrow: isEmpty ? 1 : undefined, backgroundColor: isEmpty ? colors.bg200 : undefined, borderRadius: 6, padding: 5 }}>
							<ActivityIndicator size={!isEmpty ? 'large' : 'small'} color={colors.text200} style={{ padding: 10 }} />
						</View>
					)
				}
				ListFooterComponentStyle={{ flexGrow: 1 }}
				ListHeaderComponent={
					<>
						<Button text='back' onPress={() => navigation.pop()} hasTVPreferredFocus />
						{data.name && <Text style={{ color: colors.text100 }}>{data.name}</Text>}
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
							<View></View>
							<DropDown
								items={[
									{ label: 'По порядку', value: 'POSITION_ASC' },
									{ label: 'По количеству оценок', value: 'VOTES_COUNT_DESC' },
									{ label: 'По рейтингу', value: 'KP_RATING_DESC' },
									{ label: 'По дате выхода', value: 'YEAR_DESC' },
									{ label: 'По названию', value: 'TITLE_ASC' }
								]}
								onChange={setOrder}
								value={order}
							/>
						</View>
					</>
				}
				ListHeaderComponentStyle={{ marginTop: insets.top, marginBottom: 5 }}
			/>
		</TVFocusGuideView>
	)
}
