import { Button, Input, InputType } from '@components/atoms'
import { useNavigation, useTheme } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetSuggestSearchQuery } from '../../store/kinopoisk/kinopoisk.api'
import { IGraphqlSuggestMovie, IGraphqlSuggestMovieList, IGraphqlSuggestPerson } from '../../store/kinopoisk/types'

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

const Movie = ({ item, onPress }: { item: IGraphqlSuggestMovie; onPress: (id: number) => void }) => {
	const { colors } = useTheme()

	return (
		<Button onPress={() => onPress(item.id)} animation='scale' transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https://st.kp.yandex.net/images/film_iphone/iphone360_${item.id}.jpg` }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.title.russian ?? item.title.original}
				</Text>
				<Text style={{ color: colors.text200 }}>
					{item.rating.kinopoisk?.value && item.rating.kinopoisk.value > 0 ? <Text>{item.rating.kinopoisk.value?.toFixed(1)} </Text> : null}
					{[item.__typename === 'TvSeries' ? 'сериал' : null, item.releaseYears && item.releaseYears?.length !== 0 ? (item.releaseYears?.[0]?.start === item.releaseYears?.[0]?.end ? (item.releaseYears?.[0]?.start === null ? '' : item.releaseYears?.[0]?.start) : item.releaseYears?.[0]?.start != null || item.releaseYears?.[0]?.end != null ? (item.releaseYears?.[0]?.start ?? '...') + ' - ' + (item.releaseYears?.[0]?.end ?? '...') : '') : item.productionYear].filter(it => it).join(', ')}
				</Text>
			</View>
		</Button>
	)
}

const Person = ({ item, onPress }: { item: IGraphqlSuggestPerson; onPress: (id: number) => void }) => {
	const { colors } = useTheme()

	return (
		<Button onPress={() => onPress(item.id)} animation='scale' transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https://st.kp.yandex.net/images/sm_actor/${item.id}.jpg` }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.name ?? item.originalName}
				</Text>
				<Text style={{ color: colors.text200 }}>{[item.name ? item.originalName : null, item.birthDate ? new Date(item.birthDate).getFullYear() : null].filter(it => it).join(', ')}</Text>
			</View>
		</Button>
	)
}

const MovieList = ({ item, onPress, onFilter }: { item: IGraphqlSuggestMovieList; onPress: (slug: string) => void; onFilter: (filter: string[][]) => void }) => {
	const { colors } = useTheme()

	const isFilter = item.url.includes('--') || item.url.includes('?ss_')
	const slug = item.url.split('/')[item.url.split('/').length - (item.url.endsWith('/') ? 2 : 1)]

	const stringFilters = item.url.split('movies/')[1]
	const arrayStringFilters = stringFilters
		.split('/')
		.filter(filter => filter.length > 0)
		.filter(it => !it.includes('?ss_'))
	const arrayFilters = arrayStringFilters.map(filter => filter.split('--'))

	const search =
		item.url
			.split('?')[1]
			?.split('&')
			.map(search => search.replace('ss_', '').split('=')) ?? []

	return (
		<Button onPress={() => (isFilter ? onFilter([...arrayFilters, ...search]) : onPress(slug))} animation='scale' transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https:${item.cover.avatarsUrl}/32x32` }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.name}
				</Text>
				<Text style={{ color: colors.text200 }}>{item.movies.total} фильмов</Text>
			</View>
		</Button>
	)
}

export const Search = ({ route }: Props) => {
	const defaultFilters = route.params?.data ?? {}
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()
	const navigation = useNavigation()

	const [keyword, setKeyword] = useState('')
	const { isFetching, data } = useGetSuggestSearchQuery({ keyword })

	const ref = useRef<InputType>(null)

	useEffect(() => navigation.addListener('focus', () => setTimeout(() => keyword.length === 0 && ref.current?.focus(), 0)), [navigation, ref, keyword])

	const onFilter = (filter: string[][]) => {
		const singleSelectFilterValues = filter.map(filter => ({ filterId: filter[0], value: filter[1] }))

		navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues: [], intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
	}

	const onMovieList = (slug: string) => {
		navigation.push('MovieListSlug', { data: { slug } })
	}

	const onMovie = (id: number) => {
		navigation.push('Movie', { data: { id } })
	}

	const onPerson = (id: number) => {
		// navigation.push('Person', { data: { id } })
	}

	return (
		<TVFocusGuideView style={{ flex: 1, padding: 10, paddingBottom: 10 + insets.bottom, paddingTop: 10 + insets.top }} trapFocusLeft trapFocusRight trapFocusUp>
			<Input ref={ref} value={keyword} onChangeText={setKeyword} placeholder='Фильмы, сериалы, персоны' autoFocus returnKeyType='search' inputMode='search' icon='search' clearable onClear={() => setKeyword('')} voice />

			<ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 5 }}>
				{isFetching && <ActivityIndicator />}

				{data?.topResult?.global ? (
					<View>
						<Text style={{ color: colors.text200 }}>Возможно, вы искали</Text>

						{data.topResult.global.__typename === 'Person' ? <Person onPress={onPerson} item={data.topResult.global} /> : data.topResult.global.__typename === 'MovieListMeta' ? <MovieList key={data.topResult.global.id} onPress={onMovieList} onFilter={onFilter} item={data.topResult.global} /> : <Movie onPress={onMovie} item={data.topResult.global} />}
					</View>
				) : null}

				{data?.movies && data.movies.length > 0 ? (
					<View>
						<Text style={{ color: colors.text200 }}>Фильмы и сериалы</Text>

						{data.movies.map(({ movie }) => (
							<Movie key={movie.id} onPress={onMovie} item={movie} />
						))}
					</View>
				) : null}

				{data?.movieLists && data.movieLists.length > 0 ? (
					<View>
						<Text style={{ color: colors.text200 }}>Списки и подборки</Text>

						{data.movieLists.map(({ movieList }) => (
							<MovieList key={movieList.id} onPress={onMovieList} onFilter={onFilter} item={movieList} />
						))}
					</View>
				) : null}

				{data?.persons && data.persons.length > 0 ? (
					<View>
						<Text style={{ color: colors.text200 }}>Персоны</Text>

						{data.persons.map(({ person }) => (
							<Person key={person.id} onPress={onPerson} item={person} />
						))}
					</View>
				) : null}
			</ScrollView>
		</TVFocusGuideView>
	)
}
