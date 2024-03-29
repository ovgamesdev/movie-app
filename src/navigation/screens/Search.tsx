import { ActivityIndicator, Button, Input, InputType } from '@components/atoms'
import { SearchHistory, SearchResults } from '@components/organisms'
import { useDebounce, useNavigation, useTypedDispatch } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getKinoboxPlayers, store } from '@store'
import { useGetSuggestSearchQuery } from '@store/kinopoisk'
import { WatchHistory } from '@store/settings'
import { getTMDBPosterImage, themoviedbApi } from '@store/themoviedb'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { BackHandler, KeyboardAvoidingView, NativeSyntheticEvent, ScrollView, TVFocusGuideView, Text, TextInputSubmitEditingEventData, ToastAndroid, View } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const isImdbRegex = /(tt\d{4,9})/

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

export const Search: FC<Props> = ({ route }) => {
	const defaultFilters = route.params?.data ?? {}
	const insets = useSafeAreaInsets()
	const navigation = useNavigation()
	const { styles } = useStyles(stylesheet)

	const dispatch = useTypedDispatch()

	const [keyword, setKeyword] = useState('')
	const isImdbSearch = !!isImdbRegex.exec(keyword)
	const deferredKeyword = useDebounce(keyword, 300)
	const { isFetching, data } = useGetSuggestSearchQuery({ keyword: deferredKeyword }, { skip: isImdbSearch || deferredKeyword.length === 0 })
	const isEmpty = isImdbSearch ? false : !data?.topResult?.global && !(data?.movies && data.movies.length > 0) && !(data?.movieLists && data.movieLists.length > 0) && !(data?.persons && data.persons.length > 0)
	const isLoading = isImdbSearch || deferredKeyword.length === 0 ? false : isFetching || keyword !== deferredKeyword

	const ref = useRef<InputType>(null)

	useEffect(() => navigation.addListener('focus', () => setTimeout(() => keyword.length === 0 && ref.current?.focus(), 0)), [navigation, ref, keyword])

	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => {
				if (keyword.length !== 0 && data) {
					setKeyword('')
					return true
				} else {
					return false
				}
			}

			const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)

			return () => subscription.remove()
		}, [keyword, data])
	)

	const onSubmitEditing = async ({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
		const isImdbSearch = !!isImdbRegex.exec(text)
		if (isImdbSearch) {
			watchImdb(text)
		}
	}

	const watchImdb = async (text: string) => {
		const id = isImdbRegex.exec(text)?.[0] as `tt${number}` | undefined
		if (!id) return

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
		console.log('from provider data:', providersData)
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

			navigation.navigate('Watch', { data: item })
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

			navigation.navigate('Watch', { data: item })
		} else {
			ToastAndroid.show('IMDB: Не удалось найти фильм', ToastAndroid.SHORT)
		}
	}

	return (
		<TVFocusGuideView style={[styles.container, { paddingTop: 10 + insets.top }]} trapFocusLeft trapFocusRight trapFocusUp>
			<View style={styles.inputContainer}>
				<Input ref={ref} value={keyword} onChangeText={setKeyword} onSubmitEditing={onSubmitEditing} onVoice={setKeyword} placeholder='Фильмы, сериалы, персоны' autoFocus returnKeyType='search' inputMode='search' icon='search' clearable onClear={() => setKeyword('')} voice />
			</View>

			<KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
				{isImdbSearch ? (
					<Button onPress={async () => watchImdb(deferredKeyword)} paddingHorizontal={16} paddingVertical={11} animation='scale' transparent alignItems='stretch' flexDirection='row' style={{ marginTop: 10 }}>
						<Text numberOfLines={2} style={styles.watch}>
							Смотреть как IMDB
						</Text>
					</Button>
				) : keyword.length === 0 ? (
					<SearchHistory />
				) : isLoading ? (
					<View style={styles.emptyContainer}>
						<ActivityIndicator size='small' />
					</View>
				) : isEmpty ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>По вашему запросу ничего не найдено</Text>
					</View>
				) : data ? (
					<ScrollView contentContainerStyle={[styles.resultsContainer, { paddingBottom: 15 + insets.bottom }]}>
						<SearchResults data={data} />
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
	emptyContainer: {
		height: 160,
		justifyContent: 'center',
		alignItems: 'center'
	},
	emptyText: {
		color: theme.colors.text200,
		fontSize: 15,
		paddingHorizontal: 30,
		textAlign: 'center'
	},
	watch: {
		color: theme.colors.text100,
		fontSize: 15
	}
}))
