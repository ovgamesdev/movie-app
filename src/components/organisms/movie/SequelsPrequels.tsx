import { Button, FocusableFlatList, ImageBackground } from '@components/atoms'
import { navigation } from '@navigation'
import { IMovieBaseInfo } from '@store/kinopoisk'
import { getRatingColor, isSeries, normalizeUrlWithNull } from '@utils'
import { TVFocusGuideView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'

export const SequelsPrequels = ({ sequelsPrequels }: Pick<IMovieBaseInfo, 'sequelsPrequels'>) => {
	const { theme } = useStyles()

	if (sequelsPrequels.total === 0) return null

	return (
		<View style={{ marginTop: 40 }}>
			<Text style={{ color: theme.colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 9 }}>Сиквелы и приквелы</Text>
			<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
				<FocusableFlatList
					keyExtractor={data => `sequels_prequels_item_${data.movie.id}`}
					data={sequelsPrequels.items}
					horizontal
					showsHorizontalScrollIndicator={!false}
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
										{movie.title.russian ?? movie.title.original ?? movie.title.english}
									</Text>
									<Text style={{ color: theme.colors.text200, fontSize: 14 }} numberOfLines={1}>
										{[isSeries(movie.__typename) ? movie.releaseYears[0]?.start : movie.productionYear, movie.genres[0]?.name].filter(it => !!it).join(', ')}
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
