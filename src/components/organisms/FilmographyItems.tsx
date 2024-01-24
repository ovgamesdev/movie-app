import { Button, DropDown, FocusableFlatList, ImageBackground } from '@components/atoms'
import { useOrientation } from '@hooks'
import { TimelapseIcon, VoiceIcon } from '@icons'
import { navigation } from '@navigation'
import { useGetFilmographyFiltersQuery, useGetFilmographyItemsQuery } from '@store/kinopoisk'
import { getRatingColor, normalizeUrlWithNull } from '@utils'
import React, { useRef, useState } from 'react'
import { FlatList, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'
import { Pagination } from '../molecules/Pagination'

type Props = {
	id: number
}

const generateYearIntervals = ({ start, end }: { start: number; end: number }, interval: number): { start: number; end: number }[] => {
	const intervals: { start: number; end: number }[] = []

	for (let i = start; i <= end; i += interval) {
		intervals.push({ start: i, end: i + (interval - 1) })
	}

	return intervals
}

export const FilmographyItems = ({ id: personId }: Props) => {
	const { theme } = useStyles()
	const orientation = useOrientation()

	const ref = useRef<FlatList>(null)

	const [page, setPage] = useState(1)
	const [roleSlugs, setRoleSlugs] = useState<string[]>([])
	const [year, setYear] = useState<null | { start: number; end: number }>(null)
	const [genre, setGenre] = useState<null | number>(null)
	const [orderBy, setOrderBy] = useState<string>('YEAR_DESC')

	const { data: dataFilters, isFetching: isFetchingFilters } = useGetFilmographyFiltersQuery({ personId })
	const { data, isFetching: isFetchingItems } = useGetFilmographyItemsQuery({ personId, roleSlugs: roleSlugs.length === 0 ? [dataFilters?.roles.roles.items[0]?.role.slug ?? 'ACTOR'] : roleSlugs, year, genre, orderBy, page }, { skip: dataFilters === undefined })

	const isFetching = isFetchingFilters || isFetchingItems

	const onPageChange = (page: number) => {
		setPage(page)
		ref.current?.scrollToOffset({ animated: true, offset: 0 })
	}

	if (isFetching) {
		return (
			<View style={{ marginTop: 40 }}>
				<View style={{ marginBottom: 9, gap: 5, flexDirection: 'row' }}>
					<View style={{ height: 63.3, width: 69.3, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
					<View style={{ height: 63.3, width: 149.3, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
					<View style={{ height: 63.3, width: 242.6, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
				</View>

				<View style={{ paddingVertical: 10, gap: 5, flexDirection: 'row' }}>
					<View style={{ height: 40, width: 160.6, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
					<View style={{ height: 40, width: 121.3, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
					<View style={{ height: 40, width: 179.3, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
				</View>

				<FlatList
					data={Array(10).map(({ index }) => ({ id: index }))}
					renderItem={({ index }) => (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: theme.colors.bg300 }} />}
							<View style={{ paddingVertical: 24, margin: 3 }}>
								<View style={{ width: '60%', height: 18, marginTop: 5, backgroundColor: theme.colors.bg200 }} />
								<View style={{ width: '15%', height: 12 + 4, marginTop: 5, backgroundColor: theme.colors.bg200 }} />
								<View style={{ width: '30%', height: 12, marginTop: 12, marginBottom: 2.5, backgroundColor: theme.colors.bg200 }} />
							</View>
						</>
					)}
				/>
			</View>
		)
	}

	if (!data || !dataFilters) return null

	console.log('filmography data:', data)
	console.log('dataFilters data:', dataFilters)

	return (
		<View style={{ marginTop: 40 }}>
			<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight>
				<FlatList
					ref={ref}
					horizontal
					data={dataFilters.roles.roles.items}
					renderItem={({ item: { role, movies }, index }) => {
						const isActive = roleSlugs.length === 0 ? index === 0 : roleSlugs.includes(role.slug)

						return (
							<Button onPress={() => (setRoleSlugs([role.slug]), setPage(1))} isActive={isActive} buttonColor={theme.colors.bg200} activeButtonColor={theme.colors.primary100} activePressedButtonColor={theme.getColorForTheme({ dark: 'primary200', light: 'text200' })}>
								<Text style={{ color: isActive ? theme.colors.primary300 : theme.colors.text200, fontSize: 18, fontWeight: '600' }}>{role.title.russian || role.title.english}</Text>
								<Text style={{ color: isActive ? theme.colors.primary300 : theme.colors.text200, fontSize: 13 }}>{movies.total}</Text>
							</Button>
						)
					}}
					contentContainerStyle={{ marginBottom: 9, gap: 5 }}
				/>
			</TVFocusGuideView>

			<ScrollView horizontal>
				<TVFocusGuideView style={{ justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, gap: 5, flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
					{/* TODO change to custom filter */}

					<DropDown
						items={[{ label: 'Все десятилетия', value: null }, ...generateYearIntervals(dataFilters.years.filmographyYears, 10).map(it => ({ label: it.start + '', value: it.start + '-' + it.end }))]}
						onChange={it => {
							if (it === null) {
								setYear(it)
								setPage(1)
								return
							}

							const splitted = it.split('-')
							setYear({ start: Number(splitted[0]), end: Number(splitted[1]) })
							setPage(1)
						}}
						value={year === null ? null : year.start + '-' + year.end}
						type='fullWidthToBottom'
					/>

					<DropDown
						items={[{ label: 'Все жанры', value: null }, ...dataFilters.genres.items.map(it => ({ label: it.name, value: it.id }))]}
						onChange={it => {
							setGenre(it)
							setPage(1)
						}}
						value={genre}
						type='fullWidthToBottom'
					/>

					<DropDown
						items={[
							{ label: 'Сортировка по году', value: 'YEAR_DESC' },
							{ label: 'Сортировка по хронологии', value: 'YEAR_ASC' },
							{ label: 'Сортировка по названию', value: 'TITLE_ASC' },
							{ label: 'Сортировка по рейтингу Кинопоиска', value: 'KP_RATING_DESC' },
							{ label: 'Сортировка по количеству оценок', value: 'VOTES_COUNT_DESC' }
						]}
						onChange={it => {
							setOrderBy(it)
							setPage(1)
						}}
						value={orderBy}
						type='fullWidthToBottom'
					/>
				</TVFocusGuideView>
			</ScrollView>

			<FocusableFlatList
				data={data.docs}
				renderItem={({ item: { movie, participations }, index, hasTVPreferredFocus, onBlur, onFocus }) => {
					const rating: null | { value: string; color: string } = movie.rating.expectation?.isActive && movie.rating.expectation.value && movie.rating.expectation.value > 0 ? { value: `${movie.rating.expectation.value.toFixed(0)}%`, color: getRatingColor(movie.rating.expectation.value / 10) } : movie.rating.kinopoisk?.isActive && movie.rating.kinopoisk.value && movie.rating.kinopoisk.value > 0 ? { value: `${movie.rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(movie.rating.kinopoisk.value) } : null
					const poster = normalizeUrlWithNull(movie.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

					const title = movie.title.russian ?? movie.title.original ?? movie.title.english
					const secondaryInfo = [!!movie.title.russian && movie.title.original !== movie.title.english && movie.title.original ? ' ' : '', movie.__typename === 'MiniSeries' ? 'мини–сериал' : movie.__typename === 'TvSeries' ? 'сериал' : movie.__typename === 'Video' ? 'видео' : movie.__typename === 'TvShow' ? 'ТВ' : '', 'releaseYears' in movie && movie.releaseYears.length !== 0 ? (movie.releaseYears[0]?.start === movie.releaseYears[0]?.end ? movie.releaseYears[0].start ?? '' : movie.releaseYears[0].start != null || movie.releaseYears[0].end != null ? (movie.releaseYears[0].start ?? '...') + ' - ' + (movie.releaseYears[0].end ?? '...') : '') : 'productionYear' in movie && movie.productionYear !== 0 ? movie.productionYear : null]
						.filter(it => !!it)
						.map(it => (it === ' ' ? '' : it))
						.join(', ')
					const tertiaryInfo = [
						participations.items
							.map(it => [it.name, it.notice].filter(it => !!it).join(', '))
							.filter(it => !!it)
							.join(', ')
					].join(', ')

					return (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: theme.colors.bg300 }} />}
							<Button transparent animation='scale' padding={0} paddingVertical={24} flexDirection='row' onFocus={onFocus} onBlur={onBlur} onPress={() => navigation.push('Movie', { data: { id: movie.id, type: movie.__typename } })} hasTVPreferredFocus={hasTVPreferredFocus}>
								<ImageBackground source={{ uri: poster }} style={{ height: 120, aspectRatio: 667 / 1000 }} borderRadius={6}>
									{rating && (
										<View style={{ position: 'absolute', top: 6, left: 6 }}>
											<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 20, minWidth: 32, color: '#fff', textAlign: 'center', paddingHorizontal: 5, backgroundColor: rating.color }}>{rating.value}</Text>
										</View>
									)}
								</ImageBackground>

								<View style={{ flex: 1, paddingLeft: 16 }}>
									<Text style={{ color: theme.colors.text100, fontSize: 18, marginBottom: 4 }} numberOfLines={2}>
										{title}
									</Text>
									{/* TODO fix textTransform */}

									<View style={{ paddingBottom: 4, flexDirection: 'row' }}>
										{!!movie.title.russian && movie.title.original !== movie.title.english && movie.title.original && (
											<Text style={{ flexShrink: 1, fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text100 }} numberOfLines={1}>
												{movie.title.original}
											</Text>
										)}
										<Text style={{ fontSize: 13, fontWeight: '400', lineHeight: 16, color: theme.colors.text100 }}>{secondaryInfo}</Text>
									</View>

									{tertiaryInfo && (
										<Text style={{ color: theme.colors.text200, fontSize: 13, textTransform: 'capitalize' }} numberOfLines={2}>
											{tertiaryInfo}
										</Text>
									)}
								</View>
								<View style={{ flexDirection: 'row', gap: 2, paddingLeft: 5 }}>
									{movie.isShortFilm && <TimelapseIcon width={20} height={20} fill={theme.colors.text200} />}
									{participations.items.find(it => it.notice === 'озвучка') ? <VoiceIcon width={20} height={20} fill={theme.colors.text200} /> : null}
								</View>
							</Button>
						</>
					)
				}}
				ListEmptyComponent={() => {
					return (
						<View style={{ width: '100%', flexGrow: 1, backgroundColor: theme.colors.bg200, padding: 30, borderRadius: 6, paddingHorizontal: 30 }}>
							<View style={{ justifyContent: 'center', alignItems: 'center' }}>
								<Text style={{ color: theme.colors.text100, fontSize: 18, textAlign: 'center', fontWeight: '600' }}>Ничего не найдено</Text>
								<Text style={{ color: theme.colors.text200, fontSize: 15, textAlign: 'center' }}>Попробуйте изменить параметры фильтра</Text>
							</View>
						</View>
					)
				}}
				ListFooterComponent={() => (data.pages > 1 ? <Pagination currentPage={data.page} pageCount={data.pages} pageNeighbours={orientation.landscape ? 3 : 1} onPageChange={onPageChange} /> : null)}
			/>
		</View>
	)
}
