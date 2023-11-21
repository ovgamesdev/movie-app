import { Button, DropDown } from '@components/atoms'
import { Pagination } from '@components/molecules'
import { useTheme } from '@hooks'
import { RootStackParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { FlatList, ListRenderItem, Platform, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetListBySlugQuery } from '../../store/kinopoisk/kinopoisk.api'
import { IBoxOfficeMovieListItem, IMovieItem, IPopularMovieListItem, ITopMovieListItem } from '../../store/kinopoisk/types'

type Props = NativeStackScreenProps<RootStackParamList, 'MovieListSlug'>
type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 50 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

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
	const { isFetching, data } = useGetListBySlugQuery({ slug, filters, order, page, limit: 50 }, { selectFromResult: ({ data, ...otherParams }) => ({ data: { ...data, docs: data?.docs ?? [] }, ...otherParams }) })
	const isEmpty = data.docs.length === 0

	const handleOnFocus = ({ index }: { index: number }) => {
		if (index < data.docs.length) {
			ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
		}

		focusedItem.current = { index }
	}

	const handleOnBlur = () => {
		focusedItem.current = { index: -1 }
	}

	const onPageChange = (page: number) => {
		setPage(page)
		ref.current?.scrollToOffset({ animated: true, offset: 0 })
	}

	// if (top250) { gold rating }

	const renderItem: ListRenderItem<Skeleton | IBoxOfficeMovieListItem | ITopMovieListItem | IPopularMovieListItem | IMovieItem> = ({ item, index }) => {
		if (item.__typename === 'Skeleton') {
			return <Button style={{ height: 100 }} focusable={false} />
		}

		if (item.__typename === 'PopularMovieListItem') {
			// Популярные фильмы
			return <Button style={{ height: 100 }} text={`${(page - 1) * 50 + (index + 1)}${item.positionDiff ? ' (' + item.positionDiff + ')' : ''} ${item.movie.title.russian ?? item.movie.title.original}`} onFocus={() => handleOnFocus({ index })} onBlur={handleOnBlur} onPress={() => navigation.push('Movie', { data: { id: item.movie.id } })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
		} else if (item.__typename === 'TopMovieListItem') {
			// 250 лучших фильмов
			return <Button style={{ height: 100 }} text={`${item.position}${item.positionDiff ? ' (' + item.positionDiff + ')' : ''} ${item.movie.title.russian ?? item.movie.title.original}`} onFocus={() => handleOnFocus({ index })} onBlur={handleOnBlur} onPress={() => navigation.push('Movie', { data: { id: item.movie.id } })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
		} else if (item.__typename === 'BoxOfficeMovieListItem') {
			// США: Самые кассовые фильмы в первый уик-энд проката
			return <Button style={{ height: 100 }} text={`$${(item.boxOffice.amount / 1000000).toFixed(1)} млн ${item.movie.title.russian ?? item.movie.title.original}`} onFocus={() => handleOnFocus({ index })} onBlur={handleOnBlur} onPress={() => navigation.push('Movie', { data: { id: item.movie.id } })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
		} else {
			// (item.__typename === 'MovieListItem')

			return <Button style={{ height: 100 }} text={`${item.movie.title.russian ?? item.movie.title.original}`} onFocus={() => handleOnFocus({ index })} onBlur={handleOnBlur} onPress={() => navigation.push('Movie', { data: { id: item.movie.id } })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index} />
		}
	}

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} autoFocus trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<FlatList
				keyExtractor={data => `list_${slug}_item_${data.movie.id}`}
				getItemLayout={(_, index) => ({ length: 100, offset: 100 * index, index })}
				ref={ref}
				// TODO skeleton loading
				data={isFetching ? skeletonData : data.docs}
				showsHorizontalScrollIndicator={!false}
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
					// !isFetching ? null : (
					// 	<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', flexGrow: isEmpty ? 1 : undefined, backgroundColor: isEmpty ? colors.bg200 : undefined, borderRadius: 6, padding: 5 }}>
					// 		<ActivityIndicator size={!isEmpty ? 'large' : 'small'} color={colors.text200} style={{ padding: 10 }} />
					// 	</View>
					// )

					data != null && data.page != null && data.pages != null ? <Pagination currentPage={data.page} pageCount={data.pages} pageNeighbours={Platform.isTV ? 2 : 1} onPageChange={onPageChange} /> : null
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
