import { Input, InputType } from '@components/atoms'
import { SearchResults } from '@components/organisms'
import { useNavigation } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useDeferredValue, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, ScrollView, TVFocusGuideView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetSuggestSearchQuery } from '../../store/kinopoisk/kinopoisk.api'

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

export const Search = ({ route }: Props) => {
	const defaultFilters = route.params?.data ?? {}
	const insets = useSafeAreaInsets()
	const navigation = useNavigation()

	const [keyword, setKeyword] = useState('')
	const deferredKeyword = useDeferredValue(keyword)
	const { isFetching, data } = useGetSuggestSearchQuery({ keyword: deferredKeyword })

	const ref = useRef<InputType>(null)

	useEffect(() => navigation.addListener('focus', () => setTimeout(() => keyword.length === 0 && ref.current?.focus(), 0)), [navigation, ref, keyword])

	const isEmpty = !data?.topResult?.global && !(data?.movies && data.movies.length > 0) && !(data?.movieLists && data.movieLists.length > 0) && !(data?.persons && data.persons.length > 0)
	const isLoading = keyword !== deferredKeyword || isFetching

	console.log({ isEmpty, isLoading })

	return (
		<TVFocusGuideView style={{ flex: 1, padding: 10, paddingBottom: 10 + insets.bottom, paddingTop: 10 + insets.top }} trapFocusLeft trapFocusRight trapFocusUp>
			<Input ref={ref} value={keyword} onChangeText={setKeyword} placeholder='Фильмы, сериалы, персоны' autoFocus returnKeyType='search' inputMode='search' icon='search' clearable onClear={() => setKeyword('')} voice />
			{isEmpty && isLoading && <ActivityIndicator />}

			<ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 5 }}>{data && <SearchResults data={data} />}</ScrollView>
		</TVFocusGuideView>
	)
}
