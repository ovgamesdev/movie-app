import { ActivityIndicator, Input, InputType } from '@components/atoms'
import { SearchHistory, SearchResults } from '@components/organisms'
import { useDebounce, useNavigation } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useGetSuggestSearchQuery } from '@store/kinopoisk'
import { FC, useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

export const Search: FC<Props> = ({ route }) => {
	const defaultFilters = route.params?.data ?? {}
	const insets = useSafeAreaInsets()
	const navigation = useNavigation()
	const { styles } = useStyles(stylesheet)

	const [keyword, setKeyword] = useState('')
	const deferredKeyword = useDebounce(keyword, 300)
	const { isFetching, data } = useGetSuggestSearchQuery({ keyword: deferredKeyword }, { skip: deferredKeyword.length === 0 })
	const isEmpty = !data?.topResult?.global && !(data?.movies && data.movies.length > 0) && !(data?.movieLists && data.movieLists.length > 0) && !(data?.persons && data.persons.length > 0)
	const isLoading = keyword !== deferredKeyword || isFetching

	const ref = useRef<InputType>(null)

	useEffect(() => navigation.addListener('focus', () => setTimeout(() => keyword.length === 0 && ref.current?.focus(), 0)), [navigation, ref, keyword])

	return (
		<TVFocusGuideView style={[styles.container, { paddingTop: 10 + insets.top }]} trapFocusLeft trapFocusRight trapFocusUp>
			<View style={styles.inputContainer}>
				<Input ref={ref} value={keyword} onChangeText={setKeyword} onVoice={setKeyword} placeholder='Фильмы, сериалы, персоны' autoFocus returnKeyType='search' inputMode='search' icon='search' clearable onClear={() => setKeyword('')} voice />
			</View>

			<KeyboardAvoidingView behavior='padding'>
				{keyword.length === 0 ? (
					<SearchHistory />
				) : isLoading ? (
					<View style={styles.emptyContainer}>
						<ActivityIndicator size='small' />
					</View>
				) : isEmpty ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>По вашему запросу ничего не найдено</Text>
					</View>
				) : (
					<ScrollView contentContainerStyle={[styles.resultsContainer, { paddingBottom: 15 + insets.bottom }]}>
						<SearchResults data={data} />
					</ScrollView>
				)}
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
	}
}))
