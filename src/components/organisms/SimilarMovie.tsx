import { Button, ImageBackground } from '@components/atoms'
import { useNavigation, useTheme } from '@hooks'
import { getRatingColor, isSeries, normalizeUrlWithNull } from '@utils'
import React from 'react'
import { FlatList, TVFocusGuideView, Text, View } from 'react-native'
import { useGetFilmSimilarMoviesQuery, useGetTvSeriesSimilarMoviesQuery } from '../../store/kinopoisk/kinopoisk.api'
import { ISimilarMovieResults } from '../../store/kinopoisk/kinopoisk.types'

type Props = {
	id: number
	type: 'Film' | 'TvSeries' | 'MiniSeries'
}

export const SimilarMovie = ({ id, type }: Props) => {
	const { colors } = useTheme()
	const navigation = useNavigation()

	const { data: dataFilm, isFetching: isFetchingFilm } = useGetFilmSimilarMoviesQuery({ filmId: id }, { skip: type !== 'Film' })
	const { data: dataTvSeries, isFetching: isFetchingTvSeries } = useGetTvSeriesSimilarMoviesQuery({ tvSeriesId: id }, { skip: type !== 'TvSeries' && type !== 'MiniSeries' })

	const data: ISimilarMovieResults | undefined = dataFilm ?? dataTvSeries
	const isFetching = isFetchingFilm || isFetchingTvSeries

	if (isFetching) {
		return (
			<View style={{ marginTop: 40, marginBottom: 0 }}>
				<View style={{ width: '80%', height: 22, marginTop: 5, marginBottom: 14, backgroundColor: colors.bg200 }} />
				<FlatList
					data={new Array(10)}
					horizontal
					renderItem={() => {
						return (
							<View style={{ width: 110, height: 215.5 - 2.666, padding: 5 }}>
								<View style={{ backgroundColor: colors.bg200, height: 140, /* width: 93.5 */ aspectRatio: 667 / 1000, borderRadius: 6 }} />
								<View style={{ width: '80%', height: 12, marginTop: 8, backgroundColor: colors.bg200 }} />
								<View style={{ width: '80%', height: 12, marginTop: 8, backgroundColor: colors.bg200 }} />
							</View>
						)
					}}
				/>
			</View>
		)
	}

	if (!data) return null

	return (
		<View style={{ marginTop: 40 }}>
			<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 9 }}>Если вам понравился этот {isSeries(type) ? 'сериал' : 'фильм'}</Text>
			<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
				<FlatList
					keyExtractor={data => `similar_item_${data.movie.id}`}
					data={data.items}
					horizontal
					showsHorizontalScrollIndicator={!false}
					renderItem={({ item: { movie } }) => {
						const rating: null | { value: string; color: string } = movie.rating.expectation?.isActive && movie.rating.expectation.value && movie.rating.expectation.value > 0 ? { value: `${movie.rating.expectation.value.toFixed(0)}%`, color: getRatingColor(movie.rating.expectation.value / 10) } : movie.rating.kinopoisk?.isActive && movie.rating.kinopoisk.value && movie.rating.kinopoisk.value > 0 ? { value: `${movie.rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(movie.rating.kinopoisk.value) } : null
						const poster = normalizeUrlWithNull(movie.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

						return (
							<Button key={movie.id} animation='scale' flex={0} padding={5} transparent style={{ width: 110, height: 215.5 }} onPress={() => navigation.push('Movie', { data: { id: movie.id, type: movie.__typename } })}>
								<ImageBackground source={{ uri: poster }} style={{ height: 140, /* width: 93.5 */ aspectRatio: 667 / 1000 }} borderRadius={6}>
									{rating && (
										<View style={{ position: 'absolute', top: 6, left: 6 }}>
											<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 20, minWidth: 32, color: '#fff', textAlign: 'center', paddingHorizontal: 5, backgroundColor: rating.color }}>{rating.value}</Text>
										</View>
									)}
								</ImageBackground>

								<View style={{ paddingTop: 5 }}>
									<Text style={{ color: colors.text100, fontSize: 14 }} numberOfLines={2}>
										{movie.title.russian ?? movie.title.original ?? movie.title.english}
									</Text>
									<Text style={{ color: colors.text200, fontSize: 14 }} numberOfLines={1}>
										{[movie.__typename === 'TvSeries' || movie.__typename === 'MiniSeries' ? movie.releaseYears[0].start : movie.productionYear, movie.genres[0]?.name].filter(it => !!it).join(', ')}
									</Text>
								</View>
							</Button>
						)
					}}
				/>
			</TVFocusGuideView>
		</View>
	)
}
