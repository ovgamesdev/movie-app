import { ActivityIndicator, Button, Input, InputType } from '@components/atoms'
import { SearchHistory, SearchResults, SearchResultsProvider } from '@components/organisms'
import { useActions, useDebounce, useNavigation, useTypedDispatch } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getKinoboxPlayers, store } from '@store'
import { IGraphqlSuggestMovie, useGetSuggestSearchQuery } from '@store/kinopoisk'
import { WatchHistory } from '@store/settings'
import { getTMDBPosterImage, themoviedbApi } from '@store/themoviedb'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { BackHandler, KeyboardAvoidingView, NativeSyntheticEvent, ScrollView, TVFocusGuideView, Text, TextInputSubmitEditingEventData, ToastAndroid, View } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const useExpandedSearch = ({ keyword }: { keyword: string }, { skip }: { skip: boolean }) => {
	const [isError, setIsError] = useState(false)
	const [isFetching, setIsFetching] = useState(false)

	const [data, setData] = useState<{ collaps: IGraphqlSuggestMovie[]; alloha: IGraphqlSuggestMovie[]; kodik: IGraphqlSuggestMovie[] }>({ collaps: [], alloha: [], kodik: [] })

	const refetch = () => {
		if (skip) return

		const fetchProviders = async (title: string) => {
			setIsFetching(true)

			const collaps: IGraphqlSuggestMovie[] = []
			const alloha: IGraphqlSuggestMovie[] = []
			const kodik: IGraphqlSuggestMovie[] = []

			try {
				const url = `https://api.bhcesh.me/list?token=${Config.COLLAPS_TOKEN}&name=${title}`

				const response = await fetch(url)
				const res = await response.json()

				// console.log('res:', res)

				if (Array.isArray(res.results)) {
					for (const movie of res.results) {
						const isSeries = 'seasons' in movie

						collaps.push({
							__typename: isSeries ? 'TvSeries' : 'Film',
							contentId: String(movie.id),
							id: movie.kinopoisk_id ?? (movie.imdb_id ? 'tt' + movie.imdb_id : null) ?? `COLLAPS:${movie.id}`,
							poster: {
								avatarsUrl: movie.poster,
								fallbackUrl: movie.poster
							},
							rating: {
								expectation: null,
								kinopoisk: { count: 0, isActive: true, value: typeof movie.kinopoisk === 'string' ? Number(movie.kinopoisk) : 0 }
							},
							title: {
								original: movie.origin_name ?? movie.name ?? '',
								russian: movie.name ?? movie.origin_name ?? ''
							},
							type: 'NORMAL',
							viewOption: null,
							productionYear: movie.year ?? null
						})
					}
				}
			} catch (e) {
				console.error(`fetch COLLAPS: ${title}`, e)
			}

			try {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
				const url = `${false ? 'https://api.alloha.tv' : 'https://api.apbugall.org'}/?token=${Config.ALLOHA_TOKEN}&name=${title}`

				const response = await fetch(url)
				const res = await response.json()

				// console.log('res:', res)

				if (res.status === 'success' && typeof res.data.token_movie === 'string') {
					const isSeries = 'seasons' in res.data

					alloha.push({
						__typename: isSeries ? 'TvSeries' : 'Film',
						contentId: res.data.token_movie,
						id: res.data.id_kp ?? res.data.id_imdb ?? `ALLOHA:${res.data.token_movie}`,
						poster: {
							avatarsUrl: res.data.poster,
							fallbackUrl: res.data.poster
						},
						rating: {
							expectation: null,
							kinopoisk: { count: 0, isActive: true, value: res.data.rating_kp ?? 0 }
						},
						title: {
							original: res.data.original_name ?? res.data.name ?? '',
							russian: res.data.name ?? res.data.original_name ?? ''
						},
						type: 'NORMAL',
						viewOption: null,
						productionYear: res.data.year ?? null
					})
				}
			} catch (e) {
				console.error(`fetch ALLOHA: ${title}`, e)
			}

			try {
				const url = `https://kodikapi.com/search?token=${Config.KODIK_TOKEN}&title=${title}&with_material_data=true&limit=100`

				const response = await fetch(url)
				const res = await response.json()

				// console.log('res:', res)

				if (Array.isArray(res.results)) {
					for (const movie of res.results) {
						const isSeries = 'last_season' in movie

						kodik.push({
							__typename: isSeries ? 'TvSeries' : 'Film',
							contentId: movie.id,
							id: movie.kinopoisk_id ?? movie.imdb_id ?? `KODIK:${movie.id}`,
							poster: {
								avatarsUrl: movie.material_data?.poster_url ?? null,
								fallbackUrl: movie.material_data?.poster_url ?? null
							},
							rating: {
								expectation: null,
								kinopoisk: { count: movie.material_data?.kinopoisk_votes ?? 0, isActive: true, value: movie.material_data?.kinopoisk_rating ?? 0 }
							},
							title: {
								original: `${movie.translation.title}`,
								russian: movie.title ?? movie.title_orig ?? ''
							},
							type: 'NORMAL',
							viewOption: null,
							productionYear: movie.year ?? null
						})
					}
				}
			} catch (e) {
				console.error(`fetch KODIK: ${title}`, e)
			}

			setData({ collaps, alloha, kodik })
			setIsFetching(false)
		}

		fetchProviders(keyword)
	}

	useEffect(refetch, [keyword])

	return { isError, isFetching, data, refetch }
}

const isImdbRegex = /(tt\d{4,9})/

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

export const Search: FC<Props> = ({ route }) => {
	const defaultFilters = route.params?.data ?? {}
	const insets = useSafeAreaInsets()
	const navigation = useNavigation()
	const { styles } = useStyles(stylesheet)

	const [isExpandedSearch, setIsExpandedSearch] = useState(false)

	const dispatch = useTypedDispatch()
	const { addItemToSearchHistory } = useActions()

	const [keyword, setKeyword] = useState('')
	const [isFetchingImdb, setIsFetchingImdb] = useState(false)
	const isImdbSearch = !!isImdbRegex.exec(keyword)
	const deferredKeyword = useDebounce(keyword, isExpandedSearch ? 600 : 300)
	const { isError: isErrorSearch, isFetching: isFetchingSearch, data: dataSearch, refetch: refetchSearch } = useGetSuggestSearchQuery({ keyword: deferredKeyword }, { skip: isExpandedSearch || isImdbSearch || deferredKeyword.length === 0 })
	const { isError: isErrorExpanded, isFetching: isFetchingExpanded, data: dataExpanded, refetch: refetchExpanded } = useExpandedSearch({ keyword: deferredKeyword }, { skip: !isExpandedSearch || isImdbSearch || deferredKeyword.length === 0 })

	const data = isExpandedSearch ? dataExpanded : dataSearch
	const isFetching = isFetchingSearch || isFetchingExpanded
	const isError = isErrorSearch || isErrorExpanded
	const refetch = async () => (!isExpandedSearch && refetchSearch(), isExpandedSearch && refetchExpanded())

	const isEmptyExpandedSearch = !!(data && 'collaps' in data && !(data.collaps.length > 0) && !(data.alloha.length > 0) && !(data.kodik.length > 0))
	const isEmptySearch = !!(data && 'topResult' in data && !data.topResult?.global && !(data.movies.length > 0) && !(data.movieLists.length > 0) && !(data.persons.length > 0))
	const isEmpty = isImdbSearch ? false : isExpandedSearch ? isEmptyExpandedSearch : isEmptySearch
	const isLoading = isImdbSearch || deferredKeyword.length === 0 ? false : isFetching || keyword !== deferredKeyword

	const ref = useRef<InputType>(null)

	useEffect(() => navigation.addListener('focus', () => setTimeout(() => keyword.length === 0 && ref.current?.focus(), 0)), [navigation, ref, keyword])

	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => {
				if (isExpandedSearch) {
					setIsExpandedSearch(false)
					return true
				}
				if (keyword.length !== 0 && data) {
					setKeyword('')
					return true
				} else {
					return false
				}
			}

			const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)

			return () => subscription.remove()
		}, [keyword, isExpandedSearch, data])
	)

	const onSubmitEditing = async ({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
		const isImdbSearch = !!isImdbRegex.exec(text)
		if (isImdbSearch) {
			watchImdb(text)
		}
	}

	const watchImdb = async (text: string) => {
		const id = isImdbRegex.exec(text)?.[0] as `tt${number}` | undefined
		if (!id || isFetchingImdb) return
		setIsFetchingImdb(true)

		const watchHistory = store.getState().settings.settings.watchHistory[id] as WatchHistory | undefined

		const getTitleByProviders = async ({ id }: { id: `tt${number}` }): Promise<null | Pick<WatchHistory, 'title' | 'type' | 'year' | 'poster' | 'id'>> => {
			try {
				const { data } = await getKinoboxPlayers({ id: id })
				if (data === null || data.length === 0) return null

				// COLLAPS
				if (data.find(it => it.source === 'COLLAPS')) {
					const response = await fetch(`https://api.bhcesh.me/franchise/details?token=${Config.COLLAPS_TOKEN}&${String(id).startsWith('tt') ? 'imdb_id' : 'kinopoisk_id'}=${String(id).startsWith('tt') ? String(id).replace('tt', '') : id}`)

					if (response.ok) {
						const json = await response.json()
						if (!('status' in json) && 'id' in json) {
							return {
								title: json.name ?? json.name_eng,
								id,
								poster: json.poster ?? null,
								type: 'seasons' in json ? 'TvSeries' : 'Film',
								year: json.year ?? null
							}
						}
					}
				}

				// ALLOHA
				if (data.find(it => it.source === 'ALLOHA')) {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
					const response = await fetch(`${false ? 'https://api.alloha.tv' : 'https://api.apbugall.org'}/?token=${Config.ALLOHA_TOKEN}&${String(id).startsWith('tt') ? 'imdb' : 'kp'}=${id}`)

					if (response.ok) {
						const json = await response.json()
						if (json?.data && json?.status === 'success') {
							return {
								title: json.data.name ?? json.data.original_name,
								id,
								poster: json.data.poster,
								type: 'seasons' in json.data ? 'TvSeries' : 'Film',
								year: json.data.year ?? null
							}
						}
					}
				}

				// KODIK
				if (data.find(it => it.source === 'KODIK')) {
					const response = await fetch(`https://kodikapi.com/search?${String(id).startsWith('tt') ? 'imdb' : 'kinopoisk'}_id=${id}&token=${Config.KODIK_TOKEN}`)

					if (response.ok) {
						const json = await response.json()
						if ('results' in json && Array.isArray(json.results) && json.results.length > 0) {
							return {
								title: json.results[0].title ?? json.results[0].title_orig,
								id,
								poster: typeof json.results[0].kinopoisk_id === 'string' ? `https://st.kp.yandex.net/images/film_big/${json.results[0].kinopoisk_id}.jpg` : null,
								type: 'last_season' in json.results[0] ? 'TvSeries' : 'Film',
								year: json.results[0].year ?? null
							}
						}
					}
				}

				return null
			} catch {
				return null
			}
		}

		const providersData = await getTitleByProviders({ id })
		if (providersData !== null) {
			const item: WatchHistory = watchHistory
				? { ...watchHistory, ...providersData }
				: {
						...providersData,
						provider: null,
						startTimestamp: Date.now(),
						timestamp: Date.now(),
						status: 'pause'
				  }

			console.log('from provider data:', providersData)
			addItemToSearchHistory(providersData)
			setIsFetchingImdb(false)
			navigation.push('Movie', { data: { id: item.id, type: item.type }, other: { poster: item.poster, title: item.title, year: item.year } })
			return
		}

		const { data } = await dispatch(themoviedbApi.endpoints.getMovieById.initiate({ id }))

		if (data) {
			const mutableItemData: Pick<WatchHistory, 'title' | 'type' | 'year' | 'poster' | 'id'> = data.media_type === 'tv' ? { title: data.name, id: id, type: 'TvSeries', year: Number(data.first_air_date.slice(0, 4)) || null, poster: data.poster_path ? getTMDBPosterImage(data.poster_path) : null } : { title: data.title, id, type: 'Film', year: Number(data.release_date.slice(0, 4)) || null, poster: data.poster_path ? getTMDBPosterImage(data.poster_path) : null }

			const item: WatchHistory = watchHistory
				? { ...watchHistory, ...mutableItemData }
				: {
						...mutableItemData,
						provider: null,
						startTimestamp: Date.now(),
						timestamp: Date.now(),
						status: 'pause'
				  }

			console.log('from themoviedb data:', mutableItemData)
			addItemToSearchHistory(mutableItemData)
			setIsFetchingImdb(false)
			navigation.push('Movie', { data: { id: item.id, type: item.type }, other: { poster: item.poster, title: item.title, year: item.year } })
		} else {
			setIsFetchingImdb(false)
			ToastAndroid.show('IMDB: Не удалось найти фильм', ToastAndroid.SHORT)
		}
	}

	return (
		<TVFocusGuideView style={[styles.container, { paddingTop: 10 + insets.top }]} trapFocusLeft trapFocusRight trapFocusUp>
			<View style={styles.inputContainer}>
				<Input ref={ref} value={keyword} onChangeText={setKeyword} onSubmitEditing={onSubmitEditing} onVoice={setKeyword} placeholder={isExpandedSearch ? 'Расширенный поиск: фильмы, сериалы' : 'Фильмы, сериалы, персоны'} autoFocus returnKeyType='search' inputMode='search' icon='search' clearable onClear={() => setKeyword('')} voice />
			</View>

			<KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
				{isImdbSearch ? (
					<Button onPress={async () => watchImdb(deferredKeyword)} paddingHorizontal={16} paddingVertical={11} animation='scale' transparent alignItems='stretch' flexDirection='row' style={{ marginTop: 10 }}>
						{isFetchingImdb ? (
							<>
								<Text numberOfLines={2} style={styles.watch}>
									Открытие как IMDB
								</Text>
								<ActivityIndicator size='small' style={{ paddingLeft: 5 }} />
							</>
						) : (
							<Text numberOfLines={2} style={styles.watch}>
								Открыть как IMDB
							</Text>
						)}
					</Button>
				) : keyword.length === 0 ? (
					<SearchHistory />
				) : isLoading ? (
					<View style={styles.dataContainer}>
						<ActivityIndicator size='small' />
					</View>
				) : isError ? (
					<View style={styles.dataContainer}>
						<Text style={styles.errorText}>Произошла ошибка</Text>
						<Button onPress={refetch} animation='scale' paddingVertical={5}>
							<Text style={styles.errorDescription}>Повторите попытку</Text>
						</Button>
					</View>
				) : isEmpty ? (
					<View>
						<View style={styles.dataContainer}>
							<Text style={styles.emptyText}>По вашему запросу ничего не найдено</Text>
						</View>
						{!isExpandedSearch && (
							<Button paddingHorizontal={16} paddingVertical={12} transparent onPress={async () => (setIsExpandedSearch(true), setKeyword(keyword => keyword + ' '))}>
								<Text style={styles.showMoreText}>Показать все</Text>
							</Button>
						)}
					</View>
				) : data ? (
					<ScrollView contentContainerStyle={[styles.resultsContainer, { paddingBottom: 15 + insets.bottom }]}>
						{'collaps' in data ? <SearchResultsProvider data={data} /> : <SearchResults data={data} />}
						{!isExpandedSearch && (
							<Button paddingHorizontal={16} paddingVertical={12} transparent onPress={async () => (setIsExpandedSearch(true), setKeyword(keyword => keyword + ' '))}>
								<Text style={styles.showMoreText}>Показать все</Text>
							</Button>
						)}
					</ScrollView>
				) : null}
			</KeyboardAvoidingView>
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		flex: 1
	},
	resultsContainer: {
		paddingTop: 10
	},
	inputContainer: {
		paddingHorizontal: 10
	},
	dataContainer: {
		height: 160,
		padding: 50,
		paddingHorizontal: 30,
		justifyContent: 'center',
		alignItems: 'center'
	},
	emptyText: {
		color: theme.colors.text200,
		fontSize: 15,
		paddingHorizontal: 30,
		textAlign: 'center'
	},
	showMoreText: {
		color: theme.colors.text200,
		fontSize: 13,
		fontWeight: '500'
	},
	errorText: {
		color: theme.colors.text100,
		fontSize: 16,
		paddingHorizontal: 10,
		paddingBottom: 5
	},
	errorDescription: {
		color: theme.colors.text200,
		fontSize: 12
	},
	watch: {
		color: theme.colors.text100,
		fontSize: 15
	}
}))
