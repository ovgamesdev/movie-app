import { Button, FocusableFlatList, ImageBackground } from '@components/atoms'
import { NavigateNextIcon } from '@icons'
import { navigation } from '@navigation'
import { useGetOriginalMoviesQuery } from '@store/kinopoisk'
import { getRatingColor, isSeries, normalizeUrlWithNull } from '@utils'
import { Platform, TVFocusGuideView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'

interface Props {
	id: number
}

export const OriginalMovies = ({ id }: Props) => {
	const { theme } = useStyles()

	const { data } = useGetOriginalMoviesQuery({ movieId: id })

	// TODO: test
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const company = data?.items?.[0]?.companies?.[0]

	console.log('OriginalMovies company:', company)

	if (!company) return null

	const data_url = company.originalsMovieList.url.split('/').filter(it => it)
	const slug = data_url[data_url.length - 1]

	return (
		<View style={{ marginTop: 40 }}>
			<Button focusable={false} animation='scale' transparent style={{ borderWidth: 0 }} flexDirection='row' onPress={() => navigation.push('MovieListSlug', { data: { slug } })}>
				<Text style={{ color: theme.colors.text100, fontSize: 22, lineHeight: 30, fontWeight: '600' }}>{company.displayName}: фильмы и сериалы</Text>
				{!Platform.isTV && <NavigateNextIcon width={35} height={35} fill={theme.colors.text100} />}
			</Button>

			<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
				<FocusableFlatList
					keyExtractor={data => `companies_item_${data.movie.id}`}
					data={company.originalsMovieList.movies.items}
					horizontal
					showsHorizontalScrollIndicator={!false}
					contentContainerStyle={{ flexGrow: 1 }}
					renderItem={({ item: { movie }, hasTVPreferredFocus, onBlur, onFocus }) => {
						const rating: null | { value: string; color: string } = movie.rating.expectation?.isActive && movie.rating.expectation.value && movie.rating.expectation.value > 0 ? { value: `${movie.rating.expectation.value.toFixed(0)}%`, color: getRatingColor(movie.rating.expectation.value / 10) } : movie.rating.kinopoisk?.isActive && movie.rating.kinopoisk.value && movie.rating.kinopoisk.value > 0 ? { value: `${movie.rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(movie.rating.kinopoisk.value) } : null
						const poster = normalizeUrlWithNull(movie.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

						return (
							<Button key={movie.id} animation='scale' flex={0} padding={5} transparent style={{ width: 110, height: 215.5 }} onBlur={onBlur} onFocus={onFocus} onPress={() => navigation.push('Movie', { data: { id: movie.id, type: movie.__typename } })} hasTVPreferredFocus={hasTVPreferredFocus}>
								<ImageBackground source={{ uri: poster }} style={{ height: 140, /* width: 93.5 */ aspectRatio: 667 / 1000 }} borderRadius={6}>
									{rating && (
										<View style={{ position: 'absolute', top: 6, left: 6 }}>
											<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 20, minWidth: 32, color: '#fff', textAlign: 'center', paddingHorizontal: 5, backgroundColor: rating.color }}>{rating.value}</Text>
										</View>
									)}
								</ImageBackground>

								<View style={{ paddingTop: 5 }}>
									<Text style={{ color: theme.colors.text100, fontSize: 14 }} numberOfLines={2}>
										{movie.title.russian ?? movie.title.original}
									</Text>
									<Text style={{ color: theme.colors.text200, fontSize: 14 }} numberOfLines={1}>
										{[isSeries(movie.__typename) ? movie.releaseYears[0]?.start : movie.productionYear, movie.genres[0]?.name].filter(it => !!it).join(', ')}
									</Text>
								</View>
							</Button>
						)
					}}
					ListFooterComponent={
						<>
							{!Platform.isTV ? null : (
								<Button onPress={() => navigation.push('MovieListSlug', { data: { slug } })} animation='scale' flex={0} padding={5} transparent alignItems='center' justifyContent='center' style={{ width: 110, height: 215.5 }}>
									<Text style={{ color: theme.colors.text200, fontSize: 14, paddingHorizontal: 10, paddingTop: 20, paddingBottom: 75.5 }}>More..</Text>
								</Button>
							)}
						</>
					}
				/>
			</TVFocusGuideView>
		</View>
	)
}
