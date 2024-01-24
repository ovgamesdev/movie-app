import { Button, DropDown, FocusableFlashList, FocusableFlashListRenderItem, ImageBackground, Rating } from '@components/atoms'
import { Pagination } from '@components/molecules'
import { useOrientation, useTypedSelector } from '@hooks'
import { KpTop250LIcon, KpTop250RIcon } from '@icons'
import { RootStackParamList, navigation } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { IAvailableFilters, IListBySlugResultsDocs, IListSlugFilter, SingleSelectFilter, useGetListBySlugQuery } from '@store/kinopoisk'
import { getRatingColor, isSeries, normalizeUrlWithNull, releaseYearsToString } from '@utils'
import { Dispatch, FC, SetStateAction, useCallback, useMemo, useRef, useState } from 'react'
import { FlatList, ScrollView, TVFocusGuideView, Text, TextProps, View, ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Defs as DefsSvg, LinearGradient as LinearGradientSvg, Stop as StopSvg, Svg, Text as TextSvg } from 'react-native-svg'
import { useStyles } from 'react-native-unistyles'

type Props = NativeStackScreenProps<RootStackParamList, 'MovieListSlug'>
type Skeleton = { __typename: 'Skeleton'; movie: { id: number } }

const skeletonData: Skeleton[] = Array.from({ length: 50 }, (_, index) => ({ __typename: 'Skeleton', movie: { id: index + 1 } }))

const Text250: FC<{ top: number; rating: string }> = ({ top, rating }) => {
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
	setFilters: Dispatch<SetStateAction<IListSlugFilter>>
	availableFilters: IAvailableFilters
}

export const Filter: FC<{ id: string } & FiltersProps> = ({ id, onResetPage, filters, setFilters, availableFilters }) => {
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

export const MovieListSlug: FC<Props> = ({ route }) => {
	const { slug, filters } = route.params.data

	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const orientation = useOrientation()
	const { theme } = useStyles()
	const ref = useRef<FlatList>(null)

	const [page, setPage] = useState(1)
	const [order, setOrder] = useState('POSITION_ASC')
	const [newFilters, setNewFilters] = useState<IListSlugFilter>(filters ?? { booleanFilterValues: [], intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues: [] })
	const { isError, isSuccess, data, refetch } = useGetListBySlugQuery({ slug, filters: newFilters, order, page, limit: 50 }, { selectFromResult: ({ data, ...otherParams }) => ({ data: { ...data, docs: data?.docs ?? [] }, ...otherParams }) })

	const onPageChange = (page: number) => {
		setPage(page)
		// TODO add ref
		ref.current?.scrollToOffset({ animated: true, offset: 0 })
	}

	const renderItem: FocusableFlashListRenderItem<Skeleton | IListBySlugResultsDocs> = useCallback(
		({ item, index, hasTVPreferredFocus, onBlur, onFocus }) => {
			if (item.__typename === 'Skeleton') {
				return (
					<Button style={{}} focusable={false} transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10}>
						<View style={{ height: 108, width: 72, aspectRatio: 667 / 1000, backgroundColor: theme.colors.bg200 }} />
						<View style={{ height: 92, marginLeft: 20, flex: 1 }}>
							<View style={{ width: '90%', height: 12, marginTop: 2, backgroundColor: theme.colors.bg200 }} />
							<View style={{ width: '45%', height: 12, marginTop: 15, backgroundColor: theme.colors.bg200 }} />
							<View style={{ width: '30%', height: 12, marginTop: 15, backgroundColor: theme.colors.bg200 }} />
						</View>
					</Button>
				)
			}

			const itemPosition = ((data.page ?? 1) - 1) * 50 + (index + 1)
			const ratingKinopoisk: null | { value: string; color: string; count: number } = item.movie.rating.kinopoisk?.isActive && item.movie.rating.kinopoisk.value && item.movie.rating.kinopoisk.value > 0 ? { value: `${item.movie.rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(item.movie.rating.kinopoisk.value), count: item.movie.rating.kinopoisk.count } : null

			// Популярные фильмы
			// 250 лучших фильмов
			// США: Самые кассовые фильмы в первый уик-энд проката

			return (
				<>
					{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: theme.colors.bg300 }} />}
					<Button animation='scale' transparent flexDirection='row' paddingHorizontal={0} paddingVertical={10} onFocus={onFocus} onBlur={onBlur} onPress={() => navigation.push('Movie', { data: { id: item.movie.id, type: item.movie.__typename } })} hasTVPreferredFocus={hasTVPreferredFocus}>
						{(item.__typename === 'PopularMovieListItem' || item.__typename === 'TopMovieListItem' || item.__typename === 'BoxOfficeMovieListItem') &&
							orientation.landscape &&
							(item.__typename === 'BoxOfficeMovieListItem' ? (
								<Text style={{ fontSize: 16, marginBottom: 12, fontWeight: '600', lineHeight: 20, color: theme.colors.text100, width: 64 }}>${(item.boxOffice.amount / 1000000).toFixed(1)} млн</Text>
							) : (
								<View style={{ alignItems: 'center' }}>
									<Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 12, fontWeight: '600', lineHeight: 22, color: theme.colors.text100 }}>{itemPosition}</Text>
									{item.positionDiff !== 0 && <Text style={{ textAlign: 'center', fontSize: 11, fontWeight: '500', lineHeight: 15, color: item.positionDiff < 0 ? theme.colors.warning : theme.colors.success }}>{item.positionDiff}</Text>}
								</View>
							))}
						<View style={[(item.__typename === 'PopularMovieListItem' || item.__typename === 'TopMovieListItem' || item.__typename === 'BoxOfficeMovieListItem') && orientation.landscape && { marginLeft: 20 }]}>
							<ImageBackground source={{ uri: normalizeUrlWithNull(item.movie.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' }) }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6}>
								{orientation.portrait && <Rating {...item.movie.rating} />}
							</ImageBackground>
						</View>

						<View style={{ marginLeft: 20, flex: 1 }}>
							<View style={{ minHeight: 92 }}>
								<Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 22, color: theme.colors.text100, marginBottom: 5 }} numberOfLines={2}>
									{(item.__typename === 'PopularMovieListItem' || item.__typename === 'TopMovieListItem') && orientation.portrait ? `${itemPosition}. ` : ''}
									{item.movie.title.russian ?? item.movie.title.original}
								</Text>
								<View style={{ paddingBottom: 4, flexDirection: 'row' }}>
									{item.movie.title.russian && item.movie.title.original && (
										<Text style={{ flexShrink: 1, fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text100 }} numberOfLines={1}>
											{item.movie.title.original}
										</Text>
									)}
									<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text100 }}>
										{[item.movie.title.russian && item.movie.title.original ? ' ' : null, isSeries(item.movie.__typename) ? releaseYearsToString(item.movie.releaseYears) : item.movie.productionYear, item.movie.duration ?? item.movie.totalDuration ? `${item.movie.duration ?? item.movie.totalDuration} мин.` : null]
											.filter(it => !!it)
											.map(it => (it === ' ' ? '' : it))
											.join(', ')}
									</Text>
								</View>

								<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, marginTop: 4, color: theme.colors.text200 }} numberOfLines={1}>
									{[
										item.movie.countries
											.slice(0, 2)
											.map(it => it.name)
											.join(', '),
										item.movie.genres
											.slice(0, 2)
											.map(it => it.name)
											.join(', ')
									].join(' • ')}
									{orientation.landscape && item.movie.directors.items.length > 0 && `  Режиссёр: ${item.movie.directors.items[0].person.name ?? item.movie.directors.items[0].person.originalName}`}
								</Text>

								{orientation.landscape && (
									<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, marginTop: 4, color: theme.colors.text200 }} numberOfLines={1}>
										{item.movie.cast.items.length > 0 &&
											`В ролях: ${item.movie.cast.items
												.slice(0, 2)
												.map(it => it.person.name ?? it.person.originalName)
												.filter(it => !!it)
												.join(', ')}`}
									</Text>
								)}
							</View>

							{orientation.portrait && item.__typename === 'BoxOfficeMovieListItem' && <Text style={{ fontSize: 13, fontWeight: '600', lineHeight: 16, color: theme.colors.text100 }}>${(item.boxOffice.amount / 1000000).toFixed(1)} млн</Text>}
						</View>

						{orientation.landscape && ratingKinopoisk && (
							<View style={{ marginRight: 15 }}>
								<View style={{ flexDirection: 'row' }}>
									{item.movie.top250 ? <Text250 top={item.movie.top250} rating={ratingKinopoisk.value} /> : <Text style={{ fontWeight: '600', fontSize: 18, lineHeight: 22, color: ratingKinopoisk.color }}>{ratingKinopoisk.value}</Text>}
									<Text style={{ marginTop: 4, marginLeft: 5, fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text200 }}>{ratingKinopoisk.count.toLocaleString()}</Text>
								</View>
							</View>
						)}
					</Button>
				</>
			)
		},
		[orientation, theme.colors, data.page]
	)

	const keyExtractor = useCallback((item: Skeleton | IListBySlugResultsDocs) => `list_${slug}_item_${item.movie.id}`, [slug])
	const contentContainerStyle = useMemo(() => ({ padding: 10, paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom) }), [isShowNetInfo, insets.bottom])

	const ListEmptyComponent = useCallback(() => {
		if (isSuccess) return null

		return (
			<View style={{ width: '100%', flexGrow: 1, flexShrink: 1, backgroundColor: theme.colors.bg200, padding: 5, borderRadius: 6, paddingHorizontal: 30 }}>
				<View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 18, textAlign: 'center', fontWeight: '600' }}>Ничего не найдено</Text>
					<Text style={{ color: theme.colors.text200, fontSize: 15, textAlign: 'center' }}>Попробуйте изменить параметры фильтра</Text>
				</View>
			</View>
		)
	}, [isSuccess])

	const ListFooterComponent = useCallback(() => {
		if (isError) {
			return (
				<Button onPress={refetch} animation='scale' flex={1} padding={5} transparent alignItems='center' justifyContent='center' style={{ backgroundColor: theme.colors.bg200, height: 215.5 }}>
					<Text style={{ color: theme.colors.text100, fontSize: 16, paddingHorizontal: 10 }}>Произошла ошибка</Text>
					<Text style={{ color: theme.colors.text200, fontSize: 12, paddingHorizontal: 10, paddingTop: 5 }}>Повторите попытку</Text>
				</Button>
			)
		}

		return data.page != null && data.pages != null && data.pages > 1 ? <Pagination currentPage={data.page} pageCount={data.pages} pageNeighbours={orientation.landscape ? 3 : 1} onPageChange={onPageChange} /> : null
	}, [isError, data.page, data.pages, orientation])

	const ListHeaderComponent = useCallback(() => {
		return (
			<>
				{/* <Button text='back' onPress={() => navigation.pop()} hasTVPreferredFocus /> */}
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
				<ScrollView horizontal>
					{data.availableFilters && (
						<TVFocusGuideView style={{ justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, gap: 5, flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
							<Filter id='country' onResetPage={setPage} filters={newFilters} setFilters={setNewFilters} availableFilters={data.availableFilters} />
							<Filter id='genre' onResetPage={setPage} filters={newFilters} setFilters={setNewFilters} availableFilters={data.availableFilters} />
							<Filter id='year' onResetPage={setPage} filters={newFilters} setFilters={setNewFilters} availableFilters={data.availableFilters} />
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
						</TVFocusGuideView>
					)}
				</ScrollView>
			</>
		)
	}, [orientation, order, data])

	const ListFooterComponentStyle = useMemo(() => (data.page != null && data.pages != null && data.pages > 1 ? { flexGrow: 1 } : {}), [data.page, data.pages])
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
				<Text {...props} style={[{ color: theme.colors.text100, fontSize: 20, fontWeight: '700' }, style]}>
					{data.name}
				</Text>
			)
		}
		return <Skeleton style={{ height: 27.333, width: '70%', marginBottom: 15, marginTop: 20 }} />
	}

	const DescriptionText = ({ style, ...props }: TextProps) => {
		if (data.description) {
			return (
				<Text {...props} style={[{ color: theme.colors.text100, fontSize: 13 }, style]}>
					{data.description}
				</Text>
			)
		}
		return <Skeleton style={{ height: 50.666, width: '100%' }} />
	}

	const Skeleton = ({ style, ...props }: ViewProps) => {
		if (!isError && !isSuccess) {
			return <View {...props} style={[{ backgroundColor: theme.colors.bg200, borderRadius: 6 }, style]} />
		}
		return null
	}

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} autoFocus trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<FocusableFlashList
				//
				keyExtractor={keyExtractor}
				estimatedItemSize={146}
				data={isError ? [] : !isSuccess ? skeletonData : data.docs}
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
