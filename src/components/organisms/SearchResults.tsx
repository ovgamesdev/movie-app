import { Movie, MovieList, Person } from '@components/molecules/search'
import { useActions, useNavigation, useTheme } from '@hooks'
import { ISuggestSearchResults } from '@store/kinopoisk'
import { SearchHistoryMovie, SearchHistoryMovieList, SearchHistoryPerson } from '@store/settings'
import { movieListUrlToFilters } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
	data: ISuggestSearchResults
}

export const SearchResults = ({ data }: Props) => {
	const { colors } = useTheme()
	const navigation = useNavigation()

	const { mergeItem } = useActions()

	const addToHistory = (props: Omit<SearchHistoryMovie, 'timestamp'> | Omit<SearchHistoryPerson, 'timestamp'> | Omit<SearchHistoryMovieList, 'timestamp'>) => {
		mergeItem({ searchHistory: { [`${props.type}:${props.id}`]: { ...props, timestamp: Date.now() } } })
	}

	const onMovieList = (data: Omit<SearchHistoryMovieList, 'timestamp'>) => {
		addToHistory(data)
		const { isFilter, slug, filters } = movieListUrlToFilters(data.url)
		navigation.push('MovieListSlug', { data: isFilter ? { slug: '', filters } : { slug } })
	}

	const onMovie = (data: Omit<SearchHistoryMovie, 'timestamp'>) => {
		addToHistory(data)
		navigation.push('Movie', { data: { id: data.id, type: data.type } })
	}

	const onPerson = (data: Omit<SearchHistoryPerson, 'timestamp'>) => {
		addToHistory(data)
		navigation.push('Person', { data: { id: data.id } })
	}

	return (
		<View>
			{data.topResult?.global ? (
				<View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}>
					<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>Возможно, вы искали</Text>

					{data.topResult.global.__typename === 'Person' ? <Person onPress={onPerson} item={data.topResult.global} /> : data.topResult.global.__typename === 'MovieListMeta' ? <MovieList key={data.topResult.global.id} onPress={onMovieList} item={data.topResult.global} /> : <Movie onPress={onMovie} item={data.topResult.global} />}
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

					{data.movieLists.map(({ movieList }) => (movieList === null ? null : <MovieList key={movieList.id} onPress={onMovieList} item={movieList} />))}
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
