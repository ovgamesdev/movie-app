import { ActivityIndicator, Button, ExpandText, FocusableFlashList, FocusableFlashListType, ImageBackground } from '@components/atoms'
import { useTypedSelector } from '@hooks'
import { RootStackParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useGetMovieDataByIdQuery, useGetMovieSeasonByIdQuery, type IMovieTMDBDataResults } from '@store/themoviedb'
import { formatDate, formatDuration } from '@utils'
import { FC, useEffect, useRef, useState } from 'react'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = NativeStackScreenProps<RootStackParamList, 'Episodes'>

export const Episodes: FC<Props> = ({ route }) => {
	const { id, type, tmdb_id } = route.params.data
	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { styles, theme } = useStyles(stylesheet)

	const [selectedSeason, setSelectedSeason] = useState(0)

	const { data, isFetching, isError, refetch } = useGetMovieDataByIdQuery({ id: String(tmdb_id) })

	// TODO skeleton
	if (isFetching) {
		return (
			<>
				<View style={styles.loading}>
					<ActivityIndicator size='large' />
				</View>
			</>
		)
	}

	if (isError) {
		return (
			<View style={{ flex: 1, padding: 50, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' }}>
				<Text style={{ color: theme.colors.text100, fontSize: 16, paddingHorizontal: 10, paddingBottom: 5 }}>Произошла ошибка</Text>
				<Button onPress={refetch} animation='scale' paddingVertical={5}>
					<Text style={{ color: theme.colors.text200, fontSize: 12 }}>Повторите попытку</Text>
				</Button>
			</View>
		)
	}

	if (!data) {
		// TODO add Not found
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text>Not found</Text>
			</View>
		)
	}

	// console.log('data:', data)

	return (
		<View style={{ paddingBottom: isShowNetInfo ? 0 : insets.bottom, paddingTop: insets.top, flex: 1 }}>
			<View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
				<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{data.name}</Text>
			</View>

			<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight style={{ flexDirection: 'row', borderBottomColor: theme.colors.bg300, borderBottomWidth: 1, paddingVertical: 7, backgroundColor: theme.colors.bg100 }}>
				<ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 10, gap: 12 }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14, verticalAlign: 'middle' }}>Сезоны</Text>

					{data.seasons.map(({ season_number }, index) => {
						const isActive = index === selectedSeason

						return (
							<Button key={season_number} onPress={() => !isActive && setSelectedSeason(index)} isActive={isActive} padding={4} alignItems='center' justifyContent='center' buttonColor={theme.colors.bg200} activeButtonColor={theme.colors.primary100} activePressedButtonColor={theme.getColorForTheme({ dark: 'primary200', light: 'text200' })} style={{ minWidth: 48 / 1.5 }}>
								<Text style={{ color: isActive ? theme.colors.primary300 : theme.colors.text200, fontSize: 14, textAlign: 'center' }}>{season_number}</Text>
							</Button>
						)
					})}
				</ScrollView>
			</TVFocusGuideView>

			<Season tmdbId={tmdb_id} season={data.seasons[selectedSeason]} />
		</View>
	)
}

const stylesheet = createStyleSheet(theme => ({
	loading: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: theme.colors.bg200,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))

const Season: FC<{ tmdbId: number; season: Pick<IMovieTMDBDataResults, 'seasons'>['seasons'][0] }> = ({ tmdbId, season }) => {
	const { styles, theme } = useStyles(stylesheet)

	const { data, isFetching, isError } = useGetMovieSeasonByIdQuery({ id: String(tmdbId), season: season.season_number })

	const ref = useRef<FocusableFlashListType>(null)

	useEffect(() => {
		ref.current?.scrollToOffset({ offset: 0, animated: false })
	}, [season])

	if (isFetching) {
		return (
			<View>
				<Text>loading...</Text>
			</View>
		)
	}

	if (!data || isError) {
		return (
			<View>
				<Text>error</Text>
			</View>
		)
	}

	return (
		<FocusableFlashList
			ref={ref}
			ListHeaderComponent={
				<View style={{ paddingVertical: 10 }}>
					<Text style={{ color: theme.colors.text100, fontSize: 18, fontWeight: '700' }}>
						{data.name || `Сезон ${data.season_number}`}
						{data.air_date && <Text style={{ color: theme.colors.text200, fontWeight: '400' }}> ({data.air_date.slice(0, 4)})</Text>}
					</Text>
					{typeof season.episode_count === 'number' && (
						<>
							<Text style={{ color: theme.colors.text100, fontSize: 14, fontWeight: '700' }}>
								Эпизоды
								<Text style={{ color: theme.colors.text200, fontWeight: '400' }}> {season.episode_count}</Text>
							</Text>
							{season.episode_count === 0 && <Text style={{ color: theme.colors.text200, fontSize: 14 }}>В этом сезоне не добавлено ни одного эпизода.</Text>}
						</>
					)}
					{data.overview && (
						<ExpandText style={{ color: theme.colors.text200, fontSize: 14 }} numberOfLines={4}>
							{data.overview}
						</ExpandText>
					)}
				</View>
			}
			data={data.episodes}
			contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10 }}
			renderItem={({ item: episode, index }) => {
				const episodeInfoString = [episode.air_date ? formatDate(episode.air_date) : null, episode.runtime ? `${episode.runtime} мин${episode.runtime > 60 ? '. / ' + formatDuration(episode.runtime) : ''}` : null].filter(it => !!it).join(' • ')

				return (
					<View style={{ flexDirection: 'row', gap: 10, paddingTop: index === 0 ? 0 : 10 }}>
						<ImageBackground source={{ uri: episode.still_path ? `https://image.tmdb.org/t/p/w342${episode.still_path}` : 'https://dummyimage.com/{width}x{height}/eee/aaa/342x192' }} style={{ height: 55, aspectRatio: 342 / 192 }} />
						<View style={{ flex: 1 }}>
							<View style={{ flexDirection: 'row' }}>
								<Text style={{ color: theme.colors.text100, fontSize: 15, fontWeight: '700' }}>{episode.episode_number}</Text>

								<View style={{ flex: 1, paddingLeft: 5 }}>
									<Text style={{ color: theme.colors.text100, fontSize: 14, fontWeight: '500' }} numberOfLines={2}>
										{episode.name.length > 0 ? episode.name : `Эпизод ${episode.episode_number}`}
									</Text>
									{episodeInfoString && (
										<Text style={{ color: theme.colors.text200, fontSize: 14 }} numberOfLines={1}>
											{episodeInfoString}
										</Text>
									)}
								</View>
							</View>

							{episode.overview && (
								<ExpandText style={{ color: theme.colors.text200, fontSize: 14 }} containerStyle={{ marginTop: 5 }} numberOfLines={2}>
									{episode.overview}
								</ExpandText>
							)}
						</View>
					</View>
				)
			}}
			estimatedItemSize={89}
		/>
	)
}
