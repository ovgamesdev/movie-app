import { Button, FocusableFlatList, ImageBackground, Rating } from '@components/atoms'
import { navigation } from '@navigation'
import { IMovieBaseInfo } from '@store/kinopoisk'
import { isSeries, normalizeUrlWithNull } from '@utils'
import { FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'

export const SequelsPrequels: FC<Pick<IMovieBaseInfo, 'sequelsPrequels'>> = ({ sequelsPrequels }) => {
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
						const poster = normalizeUrlWithNull(movie.poster?.avatarsUrl, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/300x450' })

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
