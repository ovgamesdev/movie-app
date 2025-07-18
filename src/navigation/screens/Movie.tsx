import { ActivityIndicator, Button, ExpandText, ImageBackground } from '@components/atoms'
import { CinematicBackdropImage, ProductionStatusText, Rating, Trailer } from '@components/molecules/movie' // /index
import { FavoritesButton } from '@components/organisms'
import { Encyclopedic, Episodes, OriginalMovies, SequelsPrequels, SimilarMovie, WatchButton, YearItem } from '@components/organisms/movie'
import { useActions, useTypedDispatch, useTypedSelector } from '@hooks'
import { RootStackParamList, navigation } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { store } from '@store'
import { IFilmBaseInfo, ITvSeriesBaseInfo, kinopoiskApi, useGetFilmBaseInfoQuery, useGetTvSeriesBaseInfoQuery } from '@store/kinopoisk'
import { BookmarksMovie, SearchHistoryMovie, WatchHistory } from '@store/settings'
import { formatDate, isSeries, isSeriesData, normalizeUrlWithNull, releaseYearsToString } from '@utils'
import { FC, useEffect, useState } from 'react'
import { Dimensions, Platform, ScrollView, StyleProp, TVFocusGuideView, Text, View, ViewStyle } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = NativeStackScreenProps<RootStackParamList, 'Movie'>

export const Movie: FC<Props> = ({ route }) => {
	const isKP = !isNaN(Number(route.params.data.id)) // number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`

	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const dispatch = useTypedDispatch()
	const { styles, theme } = useStyles(stylesheet)
	const { updateWatchHistory, updateBookmarks, mergeItem, removeItemByPath } = useActions()

	const { data: dataFilm, isFetching: isFetchingFilm, isError: isErrorFilm, refetch: refetchFilm } = useGetFilmBaseInfoQuery({ filmId: route.params.data.id as number }, { skip: !isKP || (route.params.data.type !== 'Film' && route.params.data.type !== 'Video') }) // TODO isSeries
	const { data: dataTvSeries, isFetching: isFetchingTvSeries, isError: isErrorTvSeries, refetch: refetchTvSeries } = useGetTvSeriesBaseInfoQuery({ tvSeriesId: route.params.data.id as number }, { skip: !isKP || (route.params.data.type !== 'TvSeries' && route.params.data.type !== 'MiniSeries' && route.params.data.type !== 'TvShow') }) // TODO isSeries

	const data: IFilmBaseInfo | ITvSeriesBaseInfo | undefined = dataFilm ?? dataTvSeries
	const isFetching = isFetchingFilm || isFetchingTvSeries
	const isError = isErrorFilm || isErrorTvSeries
	const refetch = async () => (isErrorTvSeries && refetchTvSeries(), isErrorFilm && refetchFilm())

	// TODO to store
	const [providersData, setProvidersData] = useState<{ backdropPath: string | null; external: { tmdbId: number | null; kpId: number | null }; isSeries: boolean | null; detail: { original: string | null; description: string | null; seasons_count: number | null; last_episode: number | null; episodesCount: number | null } | null }>({ backdropPath: null, external: { tmdbId: null, kpId: null }, isSeries: null, detail: null })

	// TODO (id:764810) `Уж не зомби ли это? OVA-1` Not found (kodik series !== kp series)

	useEffect(() => {
		const init = () => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
			const url = `${false ? 'https://api.alloha.tv' : 'https://api.apbugall.org'}/?token=${Config.ALLOHA_TOKEN}&${String(route.params.data.id).startsWith('tt') ? 'imdb' : 'kp'}=${route.params.data.id}`

			fetch(url)
				.then(async response => response.json())
				.then(async res => {
					if (res?.data) {
						const isSeries = 'seasons' in res.data

						// console.log(`id_tmdb: ${res.data.id_tmdb}, isSeries: ${isSeries}`, res)

						const backdropPath = await fetch(`https://api.themoviedb.org/3/${isSeries ? 'tv' : 'movie'}/${res.data.id_tmdb}?api_key=${Config.THEMOVIEDB_TOKEN}`)
							.then(async response => response.json())
							.then(res => {
								// console.log('themoviedb data:', res.backdrop_path)

								if ('backdrop_path' in res && typeof res.backdrop_path === 'string') {
									return res.backdrop_path as string
								}

								return null
							})

						console.log('data:', res)

						setProvidersData({ external: { tmdbId: res.data.id_tmdb ?? null, kpId: res.data.id_kp ?? null }, backdropPath, isSeries, detail: { original: res.data.original_name ?? null, description: res.data.description, seasons_count: typeof res.data.seasons_count === 'number' ? res.data.seasons_count : null, last_episode: typeof res.data.last_episode === 'number' ? res.data.last_episode : null, episodesCount: Object.keys(res?.data?.seasons ?? {}).reduce((total, key) => total + Object.keys(res?.data?.seasons[key]?.episodes ?? {}).length, 0) } })
					}
				})
		}

		init()
	}, [])

	useEffect(() => {
		const dataImdb = { ...route.params.data, ...route.params.other }

		const watchHistory = store.getState().settings.settings.watchHistory[`${dataImdb.id as number | `tt${number}`}`] as WatchHistory | undefined
		const bookmarks = store.getState().settings.settings.bookmarks[`${dataImdb.type}:${dataImdb.id}`] as BookmarksMovie | undefined
		const searchHistory = store.getState().settings.settings.searchHistory[`${dataImdb.type}:${dataImdb.id as number | `tt${number}`}`] as SearchHistoryMovie | undefined

		const movieData =
			route.params.other !== undefined || watchHistory !== undefined || bookmarks !== undefined || searchHistory !== undefined
				? {
						...dataImdb,
						id: dataImdb.id as number | `tt${number}`,
						title: (dataImdb.title ?? searchHistory?.title ?? watchHistory?.title ?? bookmarks?.title)!,
						poster: (dataImdb.poster ?? searchHistory?.poster ?? watchHistory?.poster ?? bookmarks?.poster)!,
						year: (dataImdb.year ?? searchHistory?.year ?? watchHistory?.year ?? bookmarks?.year)!
				  }
				: null

		const updateData = isKP ? (data ? { id: data.id, poster: data.poster?.avatarsUrl ?? null, title: (data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english)!, type: data.__typename, year: (isSeriesData(data) ? data.releaseYears[0]?.start : data.productionYear) ?? null } : null) : movieData

		updateBookmarks(updateData)
		updateWatchHistory(updateData)
	}, [data])

	const PosterImage = ({ width, height, borderRadius, top, style, wrapperStyle }: { width?: number; height?: number; borderRadius?: number; top?: number; style?: StyleProp<ViewStyle>; wrapperStyle?: StyleProp<ViewStyle> }) => {
		const poster = normalizeUrlWithNull(data?.poster?.avatarsUrl, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/300x450' })

		return (
			<View style={[wrapperStyle, { width: width ?? 300, height, aspectRatio: height ? undefined : 2 / 3 }]}>
				<View style={[style, { top, borderRadius }]}>
					<ImageBackground source={{ uri: poster }} style={{ width: width ?? 300, aspectRatio: 2 / 3 }} borderRadius={borderRadius} />
				</View>
			</View>
		)
	}

	const Cover = () => {
		if (!data?.cover) {
			return null
		}

		const poster = normalizeUrlWithNull(data.cover.image.avatarsUrl, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/1344x756' })

		return <CinematicBackdropImage source={{ uri: poster }} />
	}

	const BackdropImage = ({ backdropPath }: { backdropPath: string }) => {
		const window = Dimensions.get('window')
		const itemWidth = window.width

		const imageSize = itemWidth <= 500 ? 'w500' : itemWidth <= 780 ? 'w780' : itemWidth <= 1000 ? 'w1000' : itemWidth <= 1280 ? 'w1280' : 'original'

		const backdrop = `https://image.tmdb.org/t/p/${imageSize}${backdropPath}`

		return <CinematicBackdropImage source={{ uri: backdrop }} />
	}

	if (!isKP) {
		const data = { ...route.params.data, ...route.params.other }

		const watchHistory = store.getState().settings.settings.watchHistory[`${data.id as number | `tt${number}`}`] as WatchHistory | undefined
		const bookmarks = store.getState().settings.settings.bookmarks[`${data.type}:${data.id}`] as BookmarksMovie | undefined
		const searchHistory = store.getState().settings.settings.searchHistory[`${data.type}:${data.id as number | `tt${number}`}`] as SearchHistoryMovie | undefined

		const movie =
			route.params.other !== undefined || watchHistory !== undefined || bookmarks !== undefined || searchHistory !== undefined
				? {
						...data,
						id: data.id as number | `tt${number}`,
						title: (data.title ?? searchHistory?.title ?? watchHistory?.title ?? bookmarks?.title)!,
						poster: (data.poster ?? searchHistory?.poster ?? watchHistory?.poster ?? bookmarks?.poster)!,
						year: (data.year ?? searchHistory?.year ?? watchHistory?.year ?? bookmarks?.year)!
				  }
				: null

		updateWatchHistory(movie)

		if (!movie) {
			// TODO to error
			return null
		}

		return (
			<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
				<ScrollView contentContainerStyle={{ paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom) }}>
					<View style={styles.portraitCover}>{providersData.backdropPath ? <BackdropImage backdropPath={providersData.backdropPath} /> : <View style={{ paddingTop: 50 + insets.top }} />}</View>

					<View style={styles.details}>
						{/* TODO landscapeCover & PosterImage */}

						<View style={styles.detailsInfoWrapper}>
							<View style={styles.detailsInfoContainer}>
								<View style={styles.portraitCover}>
									<View style={[styles.portraitCoverPosterImageStyle, { width: 120, aspectRatio: 2 / 3 }]}>
										<View style={{ borderRadius: 6 }}>
											<ImageBackground source={{ uri: normalizeUrlWithNull(movie.poster, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/300x450' }) }} style={{ width: 120, aspectRatio: 2 / 3 }} borderRadius={6} />
										</View>
									</View>
								</View>
								<View style={styles.detailsInfo}>
									<Text style={styles.detailsInfoTitle} selectable={!Platform.isTV}>
										{movie.title} <Text>{isSeries(movie.type) ? `(сериал${movie.year ? ' ' + movie.year : ''})` : movie.year ? `(${movie.year})` : ''}</Text>
									</Text>

									<Text style={styles.detailsInfoDescription} selectable={!Platform.isTV}>
										{providersData.detail && movie.title !== providersData.detail.original ? providersData.detail.original + ' ' : ''}
										{/* {movie.restriction.age ? movie.restriction.age.replace('age', '') + '+' : ''} */}
									</Text>
								</View>
							</View>

							<View>
								<ScrollView horizontal>
									<TVFocusGuideView style={styles.buttonsContainer} autoFocus>
										<WatchButton data={movie} />
										<Button style={{ minHeight: 39.33 }} text='Изменить' onPress={() => navigation.push('ChangeFilm', { data: { id: movie.id }, other: { type: movie.type, poster: normalizeUrlWithNull(movie.poster, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/300x450' }), title: movie.title, year: movie.year } })} />
										{providersData.external.kpId !== null && (
											<Button
												style={{ minHeight: 39.33 }}
												text='Доступно на KP'
												onPress={async () => {
													if (providersData.external.kpId === null) return

													const { data: dataFilm } = providersData.isSeries ? await dispatch(kinopoiskApi.endpoints.getTvSeriesBaseInfo.initiate({ tvSeriesId: providersData.external.kpId })) : { data: undefined }
													const { data: dataTvSeries } = !providersData.isSeries ? await dispatch(kinopoiskApi.endpoints.getFilmBaseInfo.initiate({ filmId: providersData.external.kpId })) : { data: undefined }

													const _data: IFilmBaseInfo | ITvSeriesBaseInfo | undefined = dataFilm ?? dataTvSeries

													if (_data === undefined) return

													const _movie = { id: _data.id, poster: _data.poster?.avatarsUrl ?? null, title: (_data.title.russian ?? _data.title.localized ?? _data.title.original ?? _data.title.english)!, type: _data.__typename, year: (isSeriesData(_data) ? _data.releaseYears[0]?.start : _data.productionYear) ?? null }

													const watchHistory = store.getState().settings.settings.watchHistory[`${data.id as number | `tt${number}`}`] as WatchHistory | undefined

													const item: WatchHistory = watchHistory
														? { ...watchHistory, ..._movie }
														: {
																..._movie,
																provider: null,
																startTimestamp: Date.now(),
																timestamp: Date.now(),
																status: 'pause'
														  }

													console.log('data_new:', item)

													mergeItem({ watchHistory: { [`${item.id as number | `tt${number}`}`]: item } })
													removeItemByPath(['watchHistory', `${data.id}`])
													navigation.replace('Movie', { data: { id: item.id, type: item.type } })
												}}
											/>
										)}
										<FavoritesButton data={movie} />
									</TVFocusGuideView>
								</ScrollView>

								<Text style={{ color: theme.colors.text100, fontSize: 16, paddingBottom: 5 }}>Данные недоступны</Text>
								<Text style={{ color: theme.colors.text200, fontSize: 16 }} selectable>
									id: {movie.id}
								</Text>
								{providersData.detail ? (
									<>
										<Text style={styles.sectionTitleAbout}>О {providersData.isSeries ? 'сериале' : 'фильме'}</Text>

										<View style={styles.encyclopedicWrapper}>
											{typeof movie.year === 'number' && <YearItem id={movie.id} productionYear={movie.year} title='Год производства' tmdbId={providersData.external.tmdbId} type={movie.type} seasons={typeof providersData.detail.seasons_count === 'number' ? { total: providersData.detail.seasons_count } : undefined} />}

											{providersData.detail.seasons_count !== null && providersData.detail.last_episode !== null && providersData.detail.episodesCount !== null && (
												<Episodes
													episodeNumber={providersData.detail.last_episode}
													seasonNumber={providersData.detail.seasons_count}
													episodesCount={providersData.detail.episodesCount}
													disabled={providersData.external.tmdbId === null}
													onPress={() => {
														providersData.external.tmdbId !== null && navigation.push('Episodes', { data: { id: movie.id, tmdb_id: providersData.external.tmdbId, type: movie.type } })
													}}
												/>
											)}
										</View>

										<View style={styles.tabsSection}>
											<Button transparent text='Обзор' />
										</View>

										{providersData.detail.description && (
											<ExpandText style={styles.synopsis} containerStyle={styles.containerSynopsis} numberOfLines={7}>
												{providersData.detail.description}
											</ExpandText>
										)}
									</>
								) : null}
							</View>
						</View>
					</View>
				</ScrollView>
			</TVFocusGuideView>
		)
	}

	if (isFetching) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
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
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom) }}>
				<View style={styles.portraitCover}>{data.cover ? <Cover /> : providersData.backdropPath ? <BackdropImage backdropPath={providersData.backdropPath} /> : data.mainTrailer?.preview ? <CinematicBackdropImage source={{ uri: normalizeUrlWithNull(data.mainTrailer.preview.avatarsUrl, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/600x380' }) }} /> : <View style={{ paddingTop: 50 + insets.top }} />}</View>

				<View style={styles.details}>
					<View style={styles.landscapeCover}>
						<PosterImage />
						{data.mainTrailer?.preview && (
							<View style={styles.landscapeMainTrailer}>
								<Trailer mainTrailer={data.mainTrailer} />
								<Text style={styles.mainTrailerTitle}>{data.mainTrailer.title}</Text>
								<Text style={styles.mainTrailerCreatedAt}>{formatDate(data.mainTrailer.createdAt)}</Text>
							</View>
						)}
					</View>

					<View style={styles.detailsInfoWrapper}>
						<View style={styles.detailsInfoContainer}>
							<View style={styles.portraitCover}>{!!data.mainTrailer?.preview || !!data.cover ? <PosterImage width={120} height={132} borderRadius={6} top={-60} style={styles.portraitCoverPosterImage} wrapperStyle={styles.portraitCoverPosterImageWrapperStyle} /> : <PosterImage width={120} borderRadius={6} wrapperStyle={styles.portraitCoverPosterImageStyle} />}</View>
							<View style={styles.detailsInfo}>
								{data.productionStatus && data.productionStatusUpdateDate && <ProductionStatusText productionStatus={data.productionStatus} productionStatusUpdateDate={data.productionStatusUpdateDate} />}
								<Text style={styles.detailsInfoTitle} selectable={!Platform.isTV}>
									{data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english} <Text>{isSeriesData(data) ? `(${data.__typename === 'MiniSeries' ? 'мини–сериал' : 'сериал'}${releaseYearsToString(data.releaseYears) ? ' ' + releaseYearsToString(data.releaseYears) : ''})` : data.productionYear ? `(${data.productionYear})` : ''}</Text>
								</Text>

								<Text style={styles.detailsInfoDescription} selectable={!Platform.isTV}>
									{(!!data.title.russian || !!data.title.localized) && data.title.original ? data.title.original + ' ' : ''}
									{data.restriction.age ? data.restriction.age.replace('age', '') + '+' : ''}
								</Text>
							</View>
						</View>

						<View>
							<TVFocusGuideView style={styles.buttonsContainer} autoFocus>
								<WatchButton data={{ id: data.id, poster: data.poster?.avatarsUrl ?? null, title: (data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english)!, type: data.__typename, year: (isSeriesData(data) ? data.releaseYears[0]?.start : data.productionYear) ?? null }} />
								<FavoritesButton data={{ id: data.id, poster: data.poster?.avatarsUrl ?? null, title: (data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english)!, type: data.__typename, year: (isSeriesData(data) ? data.releaseYears[0]?.start : data.productionYear) ?? null }} />
							</TVFocusGuideView>

							<Text style={styles.sectionTitleAbout}>О {isSeries(data.__typename) ? 'сериале' : 'фильме'}</Text>

							<View style={styles.encyclopedicWrapper}>
								<Encyclopedic data={data} tmdbId={providersData.external.tmdbId} />

								{'seasons' in data && data.seasons.total > 0 && <Episodes id={data.id} disabled={providersData.external.tmdbId === null} onPress={() => providersData.external.tmdbId !== null && navigation.push('Episodes', { data: { id: data.id, tmdb_id: providersData.external.tmdbId, type: data.__typename } })} />}

								<SequelsPrequels sequelsPrequels={data.sequelsPrequels} />
							</View>

							<View style={styles.tabsSection}>
								<Button transparent text='Обзор' />
							</View>
							{data.synopsis && (
								<ExpandText style={styles.synopsis} containerStyle={styles.containerSynopsis} numberOfLines={7}>
									{data.synopsis}
								</ExpandText>
							)}

							<Rating __typename={data.__typename} rating={data.rating} top250={data.top250} />

							{data.mainTrailer?.preview && (
								<View style={styles.portraitCover}>
									<Text style={styles.sectionTitleTrailer}>Трейлер</Text>
									<View style={styles.mainTrailerContainer}>
										<Trailer mainTrailer={data.mainTrailer} borderRadius={6} />
										<Text style={styles.mainTrailerTitle}>{data.mainTrailer.title}</Text>
										<Text style={styles.mainTrailerCreatedAt}>{formatDate(data.mainTrailer.createdAt)}</Text>
									</View>
								</View>
							)}

							{/* <Button text='back' onPress={() => navigation.pop()} /> */}

							{data.distribution.originals.items.length > 0 && <OriginalMovies id={data.id} />}

							{data.similarMoviesCount.total > 0 && <SimilarMovie id={data.id} type={data.__typename} />}
						</View>
					</View>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		flex: 1,
		marginTop: 0,
		marginBottom: 0
	},
	portraitCover: {
		display: {
			xs: 'flex',
			sm: 'none'
		}
	},
	landscapeCover: {
		display: {
			sm: 'flex',
			xs: 'none'
		},
		width: 300,
		gap: 2
	},
	details: {
		flexDirection: {
			xs: 'column',
			sm: 'row'
		},
		padding: {
			xs: 0,
			sm: 10
		},
		paddingBottom: {
			xs: 0,
			sm: 5
		},
		gap: {
			xs: 0,
			sm: 20
		}
	},
	detailsInfoWrapper: {
		flex: 1,
		backgroundColor: {
			xs: theme.colors.bg100,
			sm: undefined
		},
		marginTop: {
			xs: -50,
			sm: 0
		},
		paddingHorizontal: {
			xs: 10,
			sm: 0
		},
		paddingTop: {
			xs: 10,
			sm: 0
		},
		borderTopLeftRadius: {
			xs: 16,
			sm: 0
		},
		borderTopRightRadius: {
			xs: 16,
			sm: 0
		}
	},
	detailsInfoContainer: {
		flexDirection: 'row',
		gap: 10
	},
	detailsInfo: {
		flex: 1
	},
	detailsInfoTitle: {
		color: theme.colors.text100,
		fontSize: 28,
		fontWeight: '700'
	},
	detailsInfoDescription: {
		color: theme.colors.text200,
		fontSize: 18
	},
	landscapeMainTrailer: {
		gap: 5,
		paddingTop: 10
	},
	mainTrailerContainer: {
		gap: 5
	},
	mainTrailerTitle: {
		color: theme.colors.text100,
		fontSize: 15
	},
	mainTrailerCreatedAt: {
		color: theme.colors.text200,
		fontSize: 13
	},
	portraitCoverPosterImage: {
		position: 'absolute',
		borderWidth: 6,
		borderColor: theme.colors.bg100,
		backgroundColor: theme.colors.bg100
	},
	portraitCoverPosterImageWrapperStyle: {
		marginLeft: 0,
		marginRight: 20
	},
	portraitCoverPosterImageStyle: {
		marginLeft: 0,
		marginRight: 10
	},
	buttonsContainer: {
		marginBottom: 5,
		marginTop: 10,
		flexDirection: 'row',
		gap: 10
	},
	sectionTitleAbout: {
		color: theme.colors.text100,
		fontSize: 22,
		fontWeight: '600',
		marginTop: 48,
		marginBottom: 9
	},
	sectionTitleTrailer: {
		color: theme.colors.text100,
		fontSize: 22,
		fontWeight: '600',
		marginBottom: 16,
		marginTop: 40
	},
	encyclopedicWrapper: {
		gap: 5,
		marginTop: 5,
		marginBottom: 40
	},
	tabsSection: {
		borderColor: theme.colors.bg300,
		borderBottomWidth: 1,
		marginBottom: 40,
		flexDirection: 'row'
	},
	synopsis: {
		color: theme.colors.text100,
		fontSize: 16
	},
	containerSynopsis: {
		marginBottom: 40
	}
}))
