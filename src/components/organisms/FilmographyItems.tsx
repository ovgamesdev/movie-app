import { Button, DropDown, FocusableFlatList } from '@components/atoms'
import { useNavigation, useOrientation, useTheme } from '@hooks'
import { useGetFilmographyFiltersQuery, useGetFilmographyItemsQuery } from '@store/kinopoisk'
import React, { useRef, useState } from 'react'
import { FlatList, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
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
	const { colors, getColorForTheme } = useTheme()
	const orientation = useOrientation()
	const navigation = useNavigation()

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
					<View style={{ height: 63.3, width: 69.3, borderRadius: 6, backgroundColor: colors.bg200 }} />
					<View style={{ height: 63.3, width: 149.3, borderRadius: 6, backgroundColor: colors.bg200 }} />
					<View style={{ height: 63.3, width: 242.6, borderRadius: 6, backgroundColor: colors.bg200 }} />
				</View>

				<View style={{ paddingVertical: 10, gap: 5, flexDirection: 'row' }}>
					<View style={{ height: 40, width: 160.6, borderRadius: 6, backgroundColor: colors.bg200 }} />
					<View style={{ height: 40, width: 121.3, borderRadius: 6, backgroundColor: colors.bg200 }} />
					<View style={{ height: 40, width: 179.3, borderRadius: 6, backgroundColor: colors.bg200 }} />
				</View>

				<FlatList
					data={Array(10).map(({ index }) => ({ id: index }))}
					renderItem={({ index }) => (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: colors.bg300 }} />}
							<View style={{ paddingVertical: 24, margin: 3 }}>
								<View style={{ width: '60%', height: 18, marginTop: 5, backgroundColor: colors.bg200 }} />
								<View style={{ width: '15%', height: 12 + 4, marginTop: 5, backgroundColor: colors.bg200 }} />
								<View style={{ width: '30%', height: 12, marginTop: 12, marginBottom: 2.5, backgroundColor: colors.bg200 }} />
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
							<Button onPress={() => (setRoleSlugs([role.slug]), setPage(1))} isActive={isActive} buttonColor={colors.bg200} activeButtonColor={colors.primary100} activePressedButtonColor={getColorForTheme({ dark: 'primary200', light: 'text200' })}>
								<Text style={{ color: isActive ? colors.primary300 : colors.text200, fontSize: 18, fontWeight: '600' }}>{role.title.russian || role.title.english}</Text>
								<Text style={{ color: isActive ? colors.primary300 : colors.text200, fontSize: 13 }}>{movies.total}</Text>
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
					const title = movie.title.russian ?? movie.title.original ?? movie.title.english
					const secondaryInfo = [!!movie.title.russian && movie.title.original !== movie.title.english && movie.title.original ? movie.title.original + ' ' : '', movie.__typename === 'MiniSeries' ? 'мини–сериал' : movie.__typename === 'TvSeries' ? 'сериал' : '', 'releaseYears' in movie && movie.releaseYears.length !== 0 ? (movie.releaseYears[0]?.start === movie.releaseYears[0]?.end ? movie.releaseYears[0].start ?? '' : movie.releaseYears[0].start != null || movie.releaseYears[0].end != null ? (movie.releaseYears[0].start ?? '...') + ' - ' + (movie.releaseYears[0].end ?? '...') : '') : 'productionYear' in movie && movie.productionYear !== 0 ? movie.productionYear : null].filter(it => !!it).join(', ')
					const tertiaryInfo = [
						participations.items
							.map(it => [it.name, it.notice].filter(it => !!it).join(', '))
							.filter(it => !!it)
							.join(', ')
					].join(', ')

					return (
						<>
							{index !== 0 && <View style={{ borderTopWidth: 1, borderColor: colors.bg300 }} />}
							<Button transparent animation='scale' padding={0} paddingVertical={24} onFocus={onFocus} onBlur={onBlur} onPress={() => navigation.push('Movie', { data: { id: movie.id, type: movie.__typename } })} hasTVPreferredFocus={hasTVPreferredFocus}>
								<Text style={{ color: colors.text100, fontSize: 18, marginBottom: 4 }} numberOfLines={1}>
									{title}
								</Text>
								{secondaryInfo && (
									<Text style={{ color: colors.text100, fontSize: 13, textTransform: 'capitalize' }} numberOfLines={1}>
										{secondaryInfo}
									</Text>
								)}
								{tertiaryInfo && (
									<Text style={{ color: colors.text200, fontSize: 13, textTransform: 'capitalize', marginTop: 4 }} numberOfLines={1}>
										{tertiaryInfo}
									</Text>
								)}
								{/* TODO rating */}
							</Button>
						</>
					)
				}}
				ListEmptyComponent={() => {
					return (
						<View style={{ width: '100%', flexGrow: 1, backgroundColor: colors.bg200, padding: 30, borderRadius: 6, paddingHorizontal: 30 }}>
							<View style={{ justifyContent: 'center', alignItems: 'center' }}>
								<Text style={{ color: colors.text100, fontSize: 18, textAlign: 'center', fontWeight: '600' }}>Ничего не найдено</Text>
								<Text style={{ color: colors.text200, fontSize: 15, textAlign: 'center' }}>Попробуйте изменить параметры фильтра</Text>
							</View>
						</View>
					)
				}}
				ListFooterComponent={() => (data.pages > 1 ? <Pagination currentPage={data.page} pageCount={data.pages} pageNeighbours={orientation.landscape ? 3 : 1} onPageChange={onPageChange} /> : null)}
			/>
		</View>
	)
}
