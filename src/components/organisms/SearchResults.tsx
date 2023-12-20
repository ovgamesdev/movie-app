import { Movie, MovieList, Person } from '@components/molecules/search'
import { useNavigation, useTheme } from '@hooks'
import { ISuggestSearchResults } from '@store/kinopoisk'
import React from 'react'
import { Text, View } from 'react-native'

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

	const onMovie = (data: { id: number; type: 'Film' | 'TvSeries' | 'MiniSeries' }) => {
		navigation.push('Movie', { data })
	}

	const onPerson = (id: number) => {
		navigation.push('Person', { data: { id } })
	}

	return (
		<View>
			{data.topResult?.global ? (
				<View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Возможно, вы искали</Text>

					{data.topResult.global.__typename === 'Person' ? <Person onPress={onPerson} item={data.topResult.global} /> : data.topResult.global.__typename === 'MovieListMeta' ? <MovieList key={data.topResult.global.id} onPress={onMovieList} onFilter={onFilter} item={data.topResult.global} /> : <Movie onPress={onMovie} item={data.topResult.global} />}
				</View>
			) : null}

			{data.movies.length > 0 ? (
				<View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Фильмы и сериалы</Text>

					{data.movies.map(({ movie }) => (movie === null ? null : <Movie key={movie.id} onPress={onMovie} item={movie} />))}
				</View>
			) : null}

			{data.movieLists.length > 0 ? (
				<View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Списки и подборки</Text>

					{data.movieLists.map(({ movieList }) => (movieList === null ? null : <MovieList key={movieList.id} onPress={onMovieList} onFilter={onFilter} item={movieList} />))}
				</View>
			) : null}

			{data.persons.length > 0 ? (
				<View style={{ paddingBottom: 10 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Персоны</Text>

					{data.persons.map(({ person }) => (person === null ? null : <Person key={person.id} onPress={onPerson} item={person} />))}
				</View>
			) : null}
		</View>
	)
}
