import { ActivityIndicator, Input, InputType } from '@components/atoms'
import { SearchResults } from '@components/organisms'
import { useNavigation, useTheme } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useDeferredValue, useEffect, useRef, useState } from 'react'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetSuggestSearchQuery } from '../../store/kinopoisk/kinopoisk.api'

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

export const Search = ({ route }: Props) => {
	const defaultFilters = route.params?.data ?? {}
	const insets = useSafeAreaInsets()
	const navigation = useNavigation()
	const { colors } = useTheme()

	const [keyword, setKeyword] = useState('')
	const deferredKeyword = useDeferredValue(keyword)
	const { isFetching, data } = useGetSuggestSearchQuery({ keyword: deferredKeyword })

	const ref = useRef<InputType>(null)

	useEffect(() => navigation.addListener('focus', () => setTimeout(() => keyword.length === 0 && ref.current?.focus(), 0)), [navigation, ref, keyword])

	const isEmpty = !data?.topResult?.global && !(data?.movies && data.movies.length > 0) && !(data?.movieLists && data.movieLists.length > 0) && !(data?.persons && data.persons.length > 0)
	const isLoading = keyword !== deferredKeyword || isFetching

	console.log({ isEmpty, isLoading })

	return (
		<TVFocusGuideView style={{ flex: 1, paddingTop: 10 + insets.top }} trapFocusLeft trapFocusRight trapFocusUp>
			<View style={{ paddingHorizontal: 10 }}>
				<Input ref={ref} value={keyword} onChangeText={setKeyword} placeholder='Фильмы, сериалы, персоны' autoFocus returnKeyType='search' inputMode='search' icon='search' clearable onClear={() => setKeyword('')} voice />
			</View>
			{/* {isEmpty && isLoading && <ActivityIndicator />} */}

			{isLoading ? (
				<View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size='small' />
				</View>
			) : isEmpty ? (
				<View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ color: colors.text200, fontSize: 15, paddingHorizontal: 30, textAlign: 'center' }}>По вашему запросу ничего не найдено</Text>
				</View>
			) : (
				<ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 15 + insets.bottom }}>{data && <SearchResults data={data} />}</ScrollView>
			)}
		</TVFocusGuideView>
	)
}
