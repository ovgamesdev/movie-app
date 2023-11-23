import { SearchMovie, SearchMovieList, SearchPerson } from '@components/molecules'
import { useNavigation, useTheme } from '@hooks'
import React from 'react'
import { Text, View } from 'react-native'
import { ISuggestSearchResults } from 'src/store/kinopoisk/kinopoisk.types'

type Props = {
	data: ISuggestSearchResults
}

export const SearchResults = ({ data }: Props) => {
	const { colors } = useTheme()
	const navigation = useNavigation()

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
		<View>
			{data?.topResult?.global ? (
				<View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Возможно, вы искали</Text>

					{data.topResult.global.__typename === 'Person' ? <SearchPerson onPress={onPerson} item={data.topResult.global} /> : data.topResult.global.__typename === 'MovieListMeta' ? <SearchMovieList key={data.topResult.global.id} onPress={onMovieList} onFilter={onFilter} item={data.topResult.global} /> : <SearchMovie onPress={onMovie} item={data.topResult.global} />}
				</View>
			) : null}

			{data?.movies && data.movies.length > 0 ? (
				<View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Фильмы и сериалы</Text>

					{data.movies.map(({ movie }) => (
						<SearchMovie key={movie.id} onPress={onMovie} item={movie} />
					))}
				</View>
			) : null}

			{data?.movieLists && data.movieLists.length > 0 ? (
				<View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Списки и подборки</Text>

					{data.movieLists.map(({ movieList }) => (
						<SearchMovieList key={movieList.id} onPress={onMovieList} onFilter={onFilter} item={movieList} />
					))}
				</View>
			) : null}

			{data?.persons && data.persons.length > 0 ? (
				<View style={{ paddingBottom: 10 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Персоны</Text>

					{data.persons.map(({ person }) => (
						<SearchPerson key={person.id} onPress={onPerson} item={person} />
					))}
				</View>
			) : null}
		</View>
	)
}
