import { ActivityIndicator, Button, ImageBackground } from '@components/atoms'
import { ProductionStatusText, Rating, Trailer } from '@components/molecules/movie' // /index
import { FavoritesButton } from '@components/organisms'
import { Encyclopedic, Episodes, OriginalMovies, SequelsPrequels, SimilarMovie, WatchButton } from '@components/organisms/movie'
import { useTypedSelector } from '@hooks'
import { RootStackParamList } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { IFilmBaseInfo, ITvSeriesBaseInfo, useGetFilmBaseInfoQuery, useGetTvSeriesBaseInfoQuery } from '@store/kinopoisk'
import { isSeries, isSeriesData, normalizeUrlWithNull, releaseYearsToString } from '@utils'
import { FC, useEffect, useState } from 'react'
import { Dimensions, Platform, ScrollView, StyleProp, TVFocusGuideView, Text, View, ViewProps, ViewStyle } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = NativeStackScreenProps<RootStackParamList, 'Movie'>

export const Movie: FC<Props> = ({ route }) => {
	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { styles } = useStyles(stylesheet)

	const { data: dataFilm, isFetching: isFetchingFilm } = useGetFilmBaseInfoQuery({ filmId: route.params.data.id }, { skip: route.params.data.type !== 'Film' && route.params.data.type !== 'Video' })
	const { data: dataTvSeries, isFetching: isFetchingTvSeries } = useGetTvSeriesBaseInfoQuery({ tvSeriesId: route.params.data.id }, { skip: route.params.data.type !== 'TvSeries' && route.params.data.type !== 'MiniSeries' && route.params.data.type !== 'TvShow' })

	const data: IFilmBaseInfo | ITvSeriesBaseInfo | undefined = dataFilm ?? dataTvSeries
	const isFetching = isFetchingFilm || isFetchingTvSeries

	// TODO to store
	const [backdropPath, setBackdropPath] = useState<null | string>(null)

	useEffect(() => {
		const init = () => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
			const url = `${false ? 'https://api.alloha.tv' : 'https://api.apbugall.org'}/?token=${Config.ALLOHA_TOKEN}&${String(route.params.data.id).startsWith('tt') ? 'imdb' : 'kp'}=${route.params.data.id}`

			fetch(url)
				.then(async response => response.json())
				.then(res => {
					if (res?.data) {
						const isSeries = 'seasons' in res.data

						console.log('id_tmdb:', res.data.id_tmdb, { isSeries })

						fetch(`https://api.themoviedb.org/3/${isSeries ? 'tv' : 'movie'}/${res.data.id_tmdb}?api_key=${Config.THEMOVIEDB_TOKEN}`)
							.then(async response => response.json())
							.then(res => {
								console.log('themoviedb data:', res.backdrop_path)

								if ('backdrop_path' in res && typeof res.backdrop_path === 'string') {
									setBackdropPath(res.backdrop_path)
								}
							})
					}
				})
		}

		init()
	}, [])

	if (isFetching) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' />
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

	console.log('data:', data)

	const PosterImage = ({ width, height, borderRadius, top, style, wrapperStyle }: { width?: number; height?: number; borderRadius?: number; top?: number; style?: StyleProp<ViewStyle>; wrapperStyle?: StyleProp<ViewStyle> }) => {
		const poster = normalizeUrlWithNull(data.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

		return (
			<View style={[wrapperStyle, { width: width ?? 300, height, aspectRatio: height ? undefined : 2 / 3 }]}>
				<View style={[style, { top, borderRadius }]}>
					<ImageBackground source={{ uri: poster }} style={{ width: width ?? 300, aspectRatio: 2 / 3 }} borderRadius={borderRadius} />
				</View>
			</View>
		)
	}

	const Cover = (props: ViewProps) => {
		if (!data.cover) {
			return null
		}

		const poster = normalizeUrlWithNull(data.cover.image.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/1344x756' })

		return (
			<View {...props}>
				<ImageBackground source={{ uri: poster }} style={{ width: '100%', aspectRatio: 16 / 9 }} />
			</View>
		)
	}

	const BackdropImage = ({ backdropPath }: { backdropPath: string }) => {
		const window = Dimensions.get('window')
		const itemWidth = window.width

		const imageSize = itemWidth <= 500 ? 'w500' : itemWidth <= 780 ? 'w780' : itemWidth <= 1000 ? 'w1000' : itemWidth <= 1280 ? 'w1280' : 'original'

		const backdrop = `https://image.tmdb.org/t/p/${imageSize}${backdropPath}`

		return <ImageBackground source={{ uri: backdrop }} style={{ width: '100%', aspectRatio: 16 / 9 }} />
	}

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom) }}>
				<View style={styles.portraitCover}>{data.cover ? <Cover /> : backdropPath ? <BackdropImage backdropPath={backdropPath} /> : data.mainTrailer?.preview ? <Trailer mainTrailer={data.mainTrailer} aspectRatio={16 / 9} disabled showPlay={false} /> : <View style={{ paddingTop: 10 + insets.top }} />}</View>

				<View style={styles.details}>
					<View style={styles.landscapeCover}>
						<PosterImage />
						{data.mainTrailer?.preview && (
							<View style={styles.landscapeMainTrailer}>
								<Trailer mainTrailer={data.mainTrailer} showTime />
								<Text style={styles.mainTrailerTitle}>{data.mainTrailer.title}</Text>
								<Text style={styles.mainTrailerCreatedAt}>{new Date(data.mainTrailer.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}</Text>
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
								<WatchButton data={data} />
								<FavoritesButton data={data} />
							</TVFocusGuideView>

							<Text style={styles.sectionTitleAbout}>О {isSeries(data.__typename) ? 'сериале' : 'фильме'}</Text>

							<View style={styles.encyclopedicWrapper}>
								<Encyclopedic data={data} />

								{'seasons' in data && data.seasons.total > 0 && <Episodes id={data.id} />}

								<SequelsPrequels sequelsPrequels={data.sequelsPrequels} />
							</View>

							<View style={styles.tabsSection}>
								<Button transparent text='Обзор' />
							</View>
							{data.synopsis && <Text style={styles.synopsis}>{data.synopsis}</Text>}

							<Rating __typename={data.__typename} rating={data.rating} top250={data.top250} />

							{data.mainTrailer?.preview && (
								<View style={styles.portraitCover}>
									<Text style={styles.sectionTitleTrailer}>Трейлер</Text>
									<View style={styles.mainTrailerContainer}>
										<Trailer mainTrailer={data.mainTrailer} showTime />
										<Text style={styles.mainTrailerTitle}>{data.mainTrailer.title}</Text>
										<Text style={styles.mainTrailerCreatedAt}>{new Date(data.mainTrailer.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}</Text>
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
			xs: -10,
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
		fontSize: 16,
		marginBottom: 40
	}
}))
