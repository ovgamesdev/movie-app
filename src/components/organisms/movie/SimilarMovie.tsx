import { Button, FocusableFlatList, ImageBackground, Rating } from '@components/atoms'
import { navigation } from '@navigation'
import { ISimilarMovieResults, MovieType, useGetFilmSimilarMoviesQuery, useGetTvSeriesSimilarMoviesQuery } from '@store/kinopoisk'
import { isSeries, normalizeUrlWithNull } from '@utils'
import { FC } from 'react'
import { FlatList, TVFocusGuideView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'

type Props = {
	id: number
	type: MovieType
}

export const SimilarMovie: FC<Props> = ({ id, type }) => {
	const { theme } = useStyles()

	const { data: dataFilm, isFetching: isFetchingFilm } = useGetFilmSimilarMoviesQuery({ filmId: id }, { skip: type !== 'Film' && type !== 'Video' })
	const { data: dataTvSeries, isFetching: isFetchingTvSeries } = useGetTvSeriesSimilarMoviesQuery({ tvSeriesId: id }, { skip: type !== 'TvSeries' && type !== 'MiniSeries' && type !== 'TvShow' })

	const data: ISimilarMovieResults | undefined = dataFilm ?? dataTvSeries
	const isFetching = isFetchingFilm || isFetchingTvSeries

	if (isFetching) {
		return (
			<View style={{ marginTop: 40, marginBottom: 0 }}>
				<View style={{ width: '80%', height: 22, marginTop: 5, marginBottom: 14, backgroundColor: theme.colors.bg200 }} />
				<FlatList
					data={new Array(10)}
					horizontal
					renderItem={() => {
						return (
							<View style={{ width: 110, height: 215.5 - 2.666, padding: 5 }}>
								<View style={{ backgroundColor: theme.colors.bg200, height: 140, /* width: 93.5 */ aspectRatio: 667 / 1000, borderRadius: 6 }} />
								<View style={{ width: '80%', height: 12, marginTop: 8, backgroundColor: theme.colors.bg200 }} />
								<View style={{ width: '80%', height: 12, marginTop: 8, backgroundColor: theme.colors.bg200 }} />
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
			<Text style={{ color: theme.colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 9 }}>Если вам понравился этот {isSeries(type) ? 'сериал' : 'фильм'}</Text>
			<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
				<FocusableFlatList
					keyExtractor={data => `similar_item_${data.movie.id}`}
					data={data.items}
					horizontal
					showsHorizontalScrollIndicator={!false}
					renderItem={({ item: { movie }, hasTVPreferredFocus, onBlur, onFocus }) => {
						const poster = normalizeUrlWithNull(movie.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

						return (
							<Button key={movie.id} animation='scale' flex={0} padding={5} transparent style={{ width: 110, height: 215.5 }} onBlur={onBlur} onFocus={onFocus} onPress={() => navigation.push('Movie', { data: { id: movie.id, type: movie.__typename } })} hasTVPreferredFocus={hasTVPreferredFocus}>
								<ImageBackground source={{ uri: poster }} style={{ height: 140, /* width: 93.5 */ aspectRatio: 667 / 1000 }} borderRadius={6}>
									<Rating {...movie.rating} />
								</ImageBackground>

								<View style={{ paddingTop: 5 }}>
									<Text style={{ color: theme.colors.text100, fontSize: 14 }} numberOfLines={2}>
										{movie.title.russian ?? movie.title.original ?? movie.title.english}
									</Text>
									<Text style={{ color: theme.colors.text200, fontSize: 14 }} numberOfLines={1}>
										{[movie.__typename === 'TvSeries' || movie.__typename === 'MiniSeries' || movie.__typename === 'TvShow' ? movie.releaseYears[0].start : movie.productionYear, movie.genres[0]?.name].filter(it => !!it).join(', ')}
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
