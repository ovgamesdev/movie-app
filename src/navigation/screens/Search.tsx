import { ActivityIndicator, Button, Input, InputType } from '@components/atoms'
import { SearchHistory, SearchResults } from '@components/organisms'
import { useDebounce, useNavigation, useTypedDispatch } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useGetSuggestSearchQuery } from '@store/kinopoisk'
import { getTMDBPosterImage, themoviedbApi } from '@store/themoviedb'
import { FC, useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, NativeSyntheticEvent, ScrollView, TVFocusGuideView, Text, TextInputSubmitEditingEventData, ToastAndroid, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const isImdbRegex = /^(tt\d{4,9})/

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

	const onSubmitEditing = async ({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
		const isNotId = !isImdbRegex.exec(text)
		if (isNotId) return

		if (text.startsWith('tt')) {
			watchImdb(text)
		}
	}

	const watchImdb = async (id: string) => {
		const { data } = await dispatch(themoviedbApi.endpoints.getMovieById.initiate({ id }))

		if (data) {
			navigation.navigate('Watch', {
				data: {
					id: id as `tt${number}`,
					poster: data.poster_path ? getTMDBPosterImage(data.poster_path) : null,
					provider: null,

					...(data.media_type === 'tv'
						? {
								title: data.name,
								type: 'TvSeries',
								year: Number(data.first_air_date.slice(0, 4)) || null
						  }
						: {
								title: data.title,
								type: 'Film',
								year: Number(data.release_date.slice(0, 4)) || null
						  })
				}
			})
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
					<Button onPress={async () => watchImdb(deferredKeyword)} paddingHorizontal={16} paddingVertical={11} animation='scale' transparent alignItems='stretch' flexDirection='row'>
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
