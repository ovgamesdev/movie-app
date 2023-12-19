import { Button, DropDown, ImageBackground } from '@components/atoms'
import { Pagination } from '@components/molecules'
import { useOrientation, useTheme, useTypedSelector } from '@hooks'
import { KpTop250LIcon, KpTop250RIcon } from '@icons'
import { RootStackParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getRatingColor, isSeries, normalizeUrlWithNull } from '@utils'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, ListRenderItem, Platform, ScrollView, TVFocusGuideView, Text, TextProps, View, ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Defs as DefsSvg, LinearGradient as LinearGradientSvg, Stop as StopSvg, Svg, Text as TextSvg } from 'react-native-svg'
import { useGetListBySlugQuery } from '../../store/kinopoisk/kinopoisk.api'
import { IAvailableFilters, IListBySlugResultsDocs, IListSlugFilter, SingleSelectFilter } from '../../store/kinopoisk/kinopoisk.types'

type Props = NativeStackScreenProps<RootStackParamList, 'MovieListSlug'>
type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 50 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

const Text250 = ({ top, rating }: { top: number; rating: string }) => {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			<KpTop250LIcon width={10} height={21} viewBox='0 0 10 24' />
			<View style={{ marginHorizontal: 7 }}>
				<Svg height={21} width={24}>
					<DefsSvg>
						<LinearGradientSvg id='gradient' x1='0%' y1='0%' x2='25%' y2='125%'>
							<StopSvg offset='16.44%' stopColor='#ffd25e' />
							<StopSvg offset='63.42%' stopColor='#b59646' />
						</LinearGradientSvg>
					</DefsSvg>
					<TextSvg x={12.5} y={17} textAnchor='middle' fill='url(#gradient)' fontSize={18} fontWeight='600'>
						{rating}
					</TextSvg>
				</Svg>
			</View>
			<KpTop250RIcon width={10} height={21} viewBox='0 0 10 24' />
		</View>
	)
}

interface FiltersProps {
	onResetPage: (page: number) => void
	filters: IListSlugFilter
	setFilters: React.Dispatch<React.SetStateAction<IListSlugFilter>>
	availableFilters: IAvailableFilters
}

const Filter = ({ id, onResetPage, filters, setFilters, availableFilters }: { id: string } & FiltersProps) => {
	const filter = availableFilters.items.find(it => it.id === id && it.__typename === 'SingleSelectFilter') as SingleSelectFilter | undefined

	// TODO add Boolean

	if (!filter) {
		return null
	}

	const filterOptions = filter.values.items.filter(it => it.selectable).map(it => ({ label: it.name.russian, value: it.value }))

	return (
		<DropDown
			items={[{ label: filter.hint.russian, value: null }, ...filterOptions]}
			onChange={value => {
				if (value === null) {
					setFilters(it => ({ ...it, singleSelectFilterValues: it.singleSelectFilterValues.filter(it => it.filterId !== id) }))
				} else {
					setFilters(it => ({ ...it, singleSelectFilterValues: [...it.singleSelectFilterValues.filter(it => it.filterId !== id), { filterId: id, value }] }))
				}

				onResetPage(1)
			}}
			value={filters.singleSelectFilterValues.find(it => it.filterId === id)?.value ?? null}
			type='fullWidthToBottom'
		/>
	)
}

export const MovieListSlug = ({ navigation, route }: Props) => {
	const { slug, filters } = route.params.data

	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const orientation = useOrientation()
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
	const [newFilters, setNewFilters] = useState<IListSlugFilter>(filters ?? { booleanFilterValues: [], intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues: [] })
	const { isFetching, data } = useGetListBySlugQuery({ slug, filters: newFilters, order, page, limit: 50 }, { selectFromResult: ({ data, ...otherParams }) => ({ data: { ...data, docs: data?.docs ?? [] }, ...otherParams }) })
	const isEmpty = data.docs.length === 0

	const handleOnFocus = ({ index }: { index: number }) => {
		if (index < data.docs.length) {
			// FIXME scrollToIndex not correct scroll
			// ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
			// ref.current?.scrollToIndex({ index, animated: true })
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

	const renderItem: ListRenderItem<Skeleton | IListBySlugResultsDocs> = useCallback(
		({ item, index }) => {
			if (item.__typename === 'Skeleton') {
				return (
					<Button style={{}} focusable={false} transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10}>
						<View style={{ height: 108, width: 72, aspectRatio: 667 / 1000, backgroundColor: colors.bg200 }} />
						<View style={{ height: 92, marginLeft: 20, flex: 1 }}>
							<View style={{ width: '90%', height: 12, marginTop: 2, backgroundColor: colors.bg200 }} />
							<View style={{ width: '45%', height: 12, marginTop: 15, backgroundColor: colors.bg200 }} />
							<View style={{ width: '30%', height: 12, marginTop: 15, backgroundColor: colors.bg200 }} />
						</View>
					</Button>
				)
			}

			const itemPosition = ((data.page ?? 1) - 1) * 50 + (index + 1)
			const rating: null | { value: string; color: string } = item.movie.rating.expectation.isActive && item.movie.rating.expectation.value && item.movie.rating.expectation.value > 0 ? { value: `${item.movie.rating.expectation.value.toFixed(0)}%`, color: getRatingColor(item.movie.rating.expectation.value / 10) } : item.movie.rating.kinopoisk.isActive && item.movie.rating.kinopoisk.value && item.movie.rating.kinopoisk.value > 0 ? { value: `${item.movie.rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(item.movie.rating.kinopoisk.value) } : null
			const ratingKinopoisk: null | { value: string; color: string; count: number } = item.movie.rating.kinopoisk.isActive && item.movie.rating.kinopoisk.value && item.movie.rating.kinopoisk.value > 0 ? { value: `${item.movie.rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(item.movie.rating.kinopoisk.value), count: item.movie.rating.kinopoisk.count } : null

			// Популярные фильмы
			// 250 лучших фильмов
			// США: Самые кассовые фильмы в первый уик-энд проката

			return (
				<>
					{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: colors.bg300 }} />}
					<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onFocus={() => handleOnFocus({ index })} onBlur={handleOnBlur} onPress={() => navigation.push('Movie', { data: { id: item.movie.id, type: item.movie.__typename } })} hasTVPreferredFocus={index === refreshFocusedItem.focus.index}>
						{(item.__typename === 'PopularMovieListItem' || item.__typename === 'TopMovieListItem' || item.__typename === 'BoxOfficeMovieListItem') &&
							orientation.landscape &&
							(item.__typename === 'BoxOfficeMovieListItem' ? (
								<Text style={{ fontSize: 16, marginBottom: 12, fontWeight: '600', lineHeight: 20, color: colors.text100, width: 64 }}>${(item.boxOffice.amount / 1000000).toFixed(1)} млн</Text>
							) : (
								<View style={{ alignItems: 'center' }}>
									<Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 12, fontWeight: '600', lineHeight: 22, color: colors.text100 }}>{itemPosition}</Text>
									{item.positionDiff !== 0 && <Text style={{ textAlign: 'center', fontSize: 11, fontWeight: '500', lineHeight: 15, color: item.positionDiff < 0 ? colors.warning : colors.success }}>{item.positionDiff}</Text>}
								</View>
							))}
						<View style={[(item.__typename === 'PopularMovieListItem' || item.__typename === 'TopMovieListItem' || item.__typename === 'BoxOfficeMovieListItem') && orientation.landscape && { marginLeft: 20 }]}>
							<ImageBackground source={{ uri: normalizeUrlWithNull(item.movie.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' }) }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6}>
								{orientation.portrait && rating && (
									<View style={{ position: 'absolute', top: 6, left: 6 }}>
										<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 20, minWidth: 32, color: '#fff', textAlign: 'center', paddingHorizontal: 5, backgroundColor: rating.color }}>{rating.value}</Text>
									</View>
								)}
							</ImageBackground>
						</View>

						<View style={{ marginLeft: 20, flex: 1 }}>
							<View style={{ minHeight: 92 }}>
								<Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: colors.text100, marginBottom: 5 }} numberOfLines={2}>
									{(item.__typename === 'PopularMovieListItem' || item.__typename === 'TopMovieListItem') && orientation.portrait ? `${itemPosition}. ` : ''}
									{item.movie.title.russian ?? item.movie.title.original}
								</Text>
								<View style={{ paddingBottom: 4, flexDirection: 'column', flexWrap: 'nowrap' }}>
									<View style={{ flexDirection: 'row', flexWrap: 'nowrap', flex: 1 }}>
										{item.movie.title.russian && item.movie.title.original && (
											<Text style={{ overflow: 'hidden', flexShrink: 1, fontSize: 13, fontWeight: '400', lineHeight: 16, color: colors.text100 }} numberOfLines={1}>
												{item.movie.title.original}
											</Text>
										)}
										<Text style={{ flexWrap: 'nowrap', fontSize: 13, fontWeight: '400', lineHeight: 16, color: colors.text100 }}>
											{item.movie.title.russian && item.movie.title.original && ', '}
											{[isSeries(item.movie.__typename) ? item.movie.releaseYears?.[0]?.start : item.movie.productionYear, item.movie.duration ? `${item.movie.duration} мин.` : ''].filter(it => !!it).join(', ')}
										</Text>
									</View>
								</View>

								<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, marginTop: 4, color: colors.text200 }} numberOfLines={1}>
									{/* {[item.movie.countries[0]?.name, item.movie.genres[0]?.name].filter(it => !!it).join(' • ')} */}
									{[item.movie.countries.map(it => it.name).join(', '), item.movie.genres.map(it => it.name).join(', ')].join(' • ')}
									{orientation.landscape && item.movie.directors.items.length > 0 && `  Режиссёр: ${item.movie.directors.items[0].person.name ?? item.movie.directors.items[0].person.originalName}`}
								</Text>

								{orientation.landscape && (
									<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, marginTop: 4, color: colors.text200 }} numberOfLines={1}>
										{item.movie.cast.items.length > 0 &&
											`В ролях: ${item.movie.cast.items
												.slice(0, 2)
												.map(it => it.person.name ?? it.person.originalName)
												.filter(it => !!it)
												.join(', ')}`}
									</Text>
								)}
							</View>

							{orientation.portrait && item.__typename === 'BoxOfficeMovieListItem' && <Text style={{ fontSize: 13, fontWeight: '600', lineHeight: 16, color: colors.text100 }}>${(item.boxOffice.amount / 1000000).toFixed(1)} млн</Text>}
						</View>

						{orientation.landscape && ratingKinopoisk && (
							<View style={{ marginRight: 15 }}>
								<View style={{ flexDirection: 'row' }}>
									{item.movie.top250 ? <Text250 top={item.movie.top250} rating={ratingKinopoisk.value} /> : <Text style={{ fontWeight: '600', fontSize: 18, lineHeight: 22, color: ratingKinopoisk.color }}>{ratingKinopoisk.value}</Text>}
									<Text style={{ marginTop: 4, marginLeft: 5, fontSize: 13, fontWeight: '400', lineHeight: 16, color: colors.text200 }}>{ratingKinopoisk.count.toLocaleString()}</Text>
								</View>
							</View>
						)}
					</Button>
				</>
			)
		},
		[orientation, colors, data.page]
	)

	const keyExtractor = useCallback((item: Skeleton | IListBySlugResultsDocs) => `list_${slug}_item_${item.movie.id}`, [slug])
	const getItemLayout = useCallback((_: unknown, index: number) => ({ length: 100, offset: 100 * index, index }), [])
	const contentContainerStyle = useMemo(() => ({ padding: 10, paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom), flexGrow: 1 }), [isShowNetInfo, insets.bottom])

	const ListEmptyComponent = useCallback(() => {
		if (isFetching) return null

		return (
			<View style={{ width: '100%', flexGrow: 1, backgroundColor: colors.bg200, padding: 5, borderRadius: 6, paddingHorizontal: 30 }}>
				<View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ color: colors.text100, fontSize: 18, textAlign: 'center', fontWeight: '600' }}>Ничего не найдено</Text>
					<Text style={{ color: colors.text200, fontSize: 15, textAlign: 'center' }}>Попробуйте изменить параметры фильтра</Text>
				</View>
			</View>
		)
	}, [isFetching])

	const ListFooterComponent = useCallback(() => {
		// !isFetching ? null : (
		// 	<View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', flexGrow: isEmpty ? 1 : undefined, backgroundColor: isEmpty ? colors.bg200 : undefined, borderRadius: 6, padding: 5 }}>
		// 		<ActivityIndicator size={!isEmpty ? 'large' : 'small'} color={colors.text200} style={{ padding: 10 }} />
		// 	</View>
		// )

		return data.page != null && data.pages != null && data.pages > 1 ? <Pagination currentPage={data.page} pageCount={data.pages} pageNeighbours={orientation.landscape ? 3 : 1} onPageChange={onPageChange} /> : null
	}, [data.page, data.pages, orientation])

	const ListHeaderComponent = useCallback(() => {
		return (
			<>
				<Button text='back' onPress={() => navigation.pop()} hasTVPreferredFocus />
				{orientation.landscape ? (
					<View style={{ flexDirection: 'row', padding: 10 }}>
						<View style={{ flex: 1, paddingRight: 20 }}>
							<NameText style={{ marginBottom: 20 }} />
							<DescriptionText />
						</View>
						<CoverImage />
					</View>
				) : (
					<View style={{ padding: 10, alignItems: 'center' }}>
						<CoverImage />
						<NameText style={{ marginBottom: 15, marginTop: 20, textAlign: 'center' }} />
						<DescriptionText />
					</View>
				)}
				<ScrollView horizontal contentContainerStyle={{ justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, gap: 5 }}>
					{data.availableFilters && (
						<>
							<Filter id='country' onResetPage={setPage} filters={newFilters} setFilters={setNewFilters} availableFilters={data.availableFilters} />
							<Filter id='genre' onResetPage={setPage} filters={newFilters} setFilters={setNewFilters} availableFilters={data.availableFilters} />
							<Filter id='year' onResetPage={setPage} filters={newFilters} setFilters={setNewFilters} availableFilters={data.availableFilters} />

							{/* <Filters availableFilters={data.availableFilters} filters={newFilters} setFilters={setNewFilters} onResetPage={setPage} /> */}
							<DropDown
								items={[
									{ label: 'По порядку', value: 'POSITION_ASC' },
									{ label: 'По количеству оценок', value: 'VOTES_COUNT_DESC' },
									{ label: 'По рейтингу', value: 'KP_RATING_DESC' },
									{ label: 'По дате выхода', value: 'YEAR_DESC' },
									{ label: 'По названию', value: 'TITLE_ASC' }
								]}
								onChange={it => {
									setOrder(it)
									setPage(1)
								}}
								value={order}
								type='fullWidthToBottom'
							/>
						</>
					)}
				</ScrollView>
			</>
		)
	}, [navigation, orientation, order, data])

	const ListFooterComponentStyle = useMemo(() => ({ flexGrow: 1 }), [])
	const ListHeaderComponentStyle = useMemo(() => ({ marginTop: insets.top, marginBottom: 5 }), [insets.top])

	const CoverImage = () => {
		if (data.cover) {
			const poster = normalizeUrlWithNull(data.cover.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/384x384' })
			return <ImageBackground source={{ uri: poster }} style={{ width: 140, height: 140 }} />
		}
		return <Skeleton style={{ width: 140, height: 140 }} />
	}

	const NameText = ({ style, ...props }: TextProps) => {
		if (data.name) {
			return (
				<Text {...props} style={[{ color: colors.text100, fontSize: 20, fontWeight: '700' }, style]}>
					{data.name}
				</Text>
			)
		}
		return <Skeleton style={{ height: 27.333, width: '70%', marginBottom: 15, marginTop: 20 }} />
	}

	const DescriptionText = ({ style, ...props }: TextProps) => {
		if (data.description) {
			return (
				<Text {...props} style={[{ color: colors.text100, fontSize: 13 }, style]}>
					{data.description}
				</Text>
			)
		}
		return <Skeleton style={{ height: 50.666, width: '100%' }} />
	}

	const Skeleton = ({ style, ...props }: ViewProps) => {
		if (isFetching) {
			return <View {...props} style={[{ backgroundColor: colors.bg200, borderRadius: 6 }, style]} />
		}
		return null
	}

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} autoFocus trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<FlatList
				//
				keyExtractor={keyExtractor}
				getItemLayout={getItemLayout}
				ref={ref}
				data={isFetching ? skeletonData : data.docs}
				showsHorizontalScrollIndicator={!false}
				contentContainerStyle={contentContainerStyle}
				renderItem={renderItem}
				ListEmptyComponent={ListEmptyComponent}
				ListFooterComponent={ListFooterComponent}
				ListFooterComponentStyle={ListFooterComponentStyle}
				ListHeaderComponent={ListHeaderComponent}
				ListHeaderComponentStyle={ListHeaderComponentStyle}
			/>
		</TVFocusGuideView>
	)
}
